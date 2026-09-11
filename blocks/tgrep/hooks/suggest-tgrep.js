#!/usr/bin/env node
// PreToolUse hook, matcher Grep.
// Смысл: встроенный Grep стоит агенту один вызов, tgrep через Bash это вызов
// плюс дисциплина, поэтому одной строки в SKILL.md недостаточно. Хук отдаёт
// уже собранную команду в момент вызова, переводя флаги Grep во флаги tgrep.
//
// Не блокирует никогда: permissionDecision "allow" + additionalContext.
// Молчит совсем, если индекса .tgrep в корне нет. На обычном проекте
// оверхед нулевой, ложных срабатываний нет.
//
// Порог применимости решается один раз, при постройке индекса (SKILL.md),
// а не на каждый вызов: есть .tgrep, значит крупный репозиторий уже признан.
//
//   node suggest-tgrep.js              обычный запуск хуком
//   node suggest-tgrep.js --selftest   прогон встроенных проверок

const fs = require("fs");
const os = require("os");
const path = require("path");

const MAX_HINTS = 3; // напоминаем несколько раз за сессию, дальше молчим

function hasIndex(root) {
  try {
    return fs.existsSync(path.join(root, ".tgrep"));
  } catch (_) {
    return false;
  }
}

// Одинарные кавычки безопаснее для regex: внутри них шелл ничего не трогает.
function shellQuote(s) {
  return "'" + String(s).replace(/'/g, "'\''") + "'";
}

// Перевод полей Grep во флаги tgrep. Порядок из AGENTS.md источника:
// tgrep <флаги> -- <паттерн> <путь>
function buildCommand(input) {
  const flags = [];
  const mode = input.output_mode || "files_with_matches";

  if (mode === "files_with_matches") flags.push("-l");
  else if (mode === "count") flags.push("-c");
  else flags.push("--vimgrep"); // content: file:line:col:text

  if (input["-i"]) flags.push("-i");
  if (input.multiline) flags.push("-U");

  if (mode === "content") {
    if (input["-C"] != null) flags.push("-C", String(input["-C"]));
    else {
      if (input["-A"] != null) flags.push("-A", String(input["-A"]));
      if (input["-B"] != null) flags.push("-B", String(input["-B"]));
    }
  }

  if (input.glob) flags.push("-g", shellQuote(input.glob));
  if (input.type) flags.push("-t", input.type);
  if (input.head_limit != null) flags.push("-m", String(input.head_limit));

  const target = input.path ? shellQuote(input.path) : ".";
  return ["tgrep", ...flags, "--", shellQuote(input.pattern || ""), target].join(" ");
}

function hintCounterPath(sessionId) {
  const safe = String(sessionId || "no-session").replace(/[^A-Za-z0-9_-]/g, "");
  return path.join(os.tmpdir(), `tgrep-hint-${safe}`);
}

function shouldHint(sessionId) {
  const f = hintCounterPath(sessionId);
  let n = 0;
  try {
    n = parseInt(fs.readFileSync(f, "utf8"), 10) || 0;
  } catch (_) {}
  if (n >= MAX_HINTS) return false;
  try {
    fs.writeFileSync(f, String(n + 1));
  } catch (_) {}
  return true;
}

function evaluate(ev) {
  if ((ev.tool_name || "") !== "Grep") return null;
  const root = ev.cwd || process.cwd();
  if (!hasIndex(root)) return null;
  if (!shouldHint(ev.session_id)) return null;
  const cmd = buildCommand(ev.tool_input || {});
  return `В этом репозитории есть индекс tgrep, точный поиск через него быстрее встроенного Grep. Та же выборка одной командой Bash:\n${cmd}\nКоды выхода: 0 нашлось, 1 не нашлось (это не ошибка), 2 ошибка.`;
}

function allowWithContext(text) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        additionalContext: text,
      },
    })
  );
}

// --- selftest ---
function selftest() {
  const cases = [
    [{ pattern: "foo" }, "tgrep -l -- 'foo' ."],
    [{ pattern: "foo", output_mode: "content" }, "tgrep --vimgrep -- 'foo' ."],
    [{ pattern: "foo", output_mode: "count", path: "src" }, "tgrep -c -- 'foo' 'src'"],
    [{ pattern: "a.b", "-i": true, glob: "*.ts" }, "tgrep -l -i -g '*.ts' -- 'a.b' ."],
    [{ pattern: "x", output_mode: "content", "-C": 2 }, "tgrep --vimgrep -C 2 -- 'x' ."],
    [{ pattern: "x", output_mode: "content", "-A": 1, "-B": 3 }, "tgrep --vimgrep -A 1 -B 3 -- 'x' ."],
    [{ pattern: "x", "-A": 5 }, "tgrep -l -- 'x' ."], // контекст без content не имеет смысла
    [{ pattern: "x", type: "py", head_limit: 20 }, "tgrep -l -t py -m 20 -- 'x' ."],
    [{ pattern: "a\nb", multiline: true }, "tgrep -l -U -- 'a\nb' ."],
    [{ pattern: "it's" }, "tgrep -l -- 'it'\''s' ."],
  ];
  let ok = 0;
  for (const [input, expected] of cases) {
    const got = buildCommand(input);
    if (got === expected) ok++;
    else console.log(`FAIL ${JSON.stringify(input)}\n  ждали: ${expected}\n  вышло: ${got}`);
  }

  // молчим не на Grep и без индекса
  const quiet = [
    evaluate({ tool_name: "Bash", cwd: __dirname, tool_input: {} }),
    evaluate({ tool_name: "Grep", cwd: path.join(__dirname, "нет-такой-папки"), tool_input: { pattern: "x" } }),
  ];
  const total = cases.length + quiet.length;
  for (const q of quiet) {
    if (q === null) ok++;
    else console.log(`FAIL ожидали молчание, вышло: ${q}`);
  }
  console.log(`${ok}/${total} ok`);
  process.exit(ok === total ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  let raw = "";
  process.stdin.on("data", (d) => (raw += d));
  process.stdin.on("end", () => {
    try {
      const text = evaluate(JSON.parse(raw || "{}"));
      if (text) allowWithContext(text);
    } catch (_) {
      // молча пропускаем: хук не должен ронять сессию
    }
    process.exit(0);
  });
}

