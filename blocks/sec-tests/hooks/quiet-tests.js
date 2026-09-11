#!/usr/bin/env node
// PreToolUse hook, matcher Bash. Оборачивает тестовые команды в green-filter,
// чтобы зелёный прогон не сыпал полным выводом в контекст агента.
//
// Матчит популярные раннеры (jest, vitest, pytest, go test, rspec, playwright,
// mocha). Уже обёрнутое или не-тест пропускает без изменений.
//
// Замена команды — через updatedInput. Версия Codex без поддержки
// updatedInput просто ничего не меняет (хук безвреден): тогда гоняй тесты через
// green-filter вручную, скилл sec-tests это указывает.
//
//   node quiet-tests.js              обычный запуск хуком
//   node quiet-tests.js --selftest   прогон проверок над rewrite()

const path = require("path");

const RUNNER = /\b(jest|vitest|pytest|go\s+test|rspec|playwright\s+test|mocha|npm\s+test|npm\s+run\s+test|yarn\s+test|pnpm\s+test)\b/i;

function rewrite(command, filterPath) {
  if (!command || !RUNNER.test(command)) return null;
  if (command.includes("green-filter")) return null; // уже обёрнуто
  if (/[|&;><]/.test(command)) return null; // сложный пайп/цепочка — не трогаем
  const b64 = Buffer.from(command, "utf8").toString("base64");
  return `node "${filterPath}" --b64 ${b64}`;
}

function selftest() {
  const fp = "/x/green-filter.js";
  // Проверяем: тест-команда оборачивается и декодируется обратно без потерь;
  // не-тест и уже обёрнутое дают null.
  const wrapped = rewrite('npx jest -t "some name"', fp);
  const b64 = wrapped && wrapped.split("--b64 ")[1];
  const back = b64 && Buffer.from(b64, "base64").toString("utf8");
  const cases = [
    [back === 'npx jest -t "some name"', "round-trip сохраняет кавычки"],
    [rewrite("pytest tests/", fp) !== null, "pytest оборачивается"],
    [rewrite("go test ./...", fp) !== null, "go test оборачивается"],
    [rewrite("ls -la", fp) === null, "ls не трогаем"],
    [rewrite("git status", fp) === null, "git status не трогаем"],
    [rewrite(`node "/x/green-filter.js" --b64 AA`, fp) === null, "уже обёрнутое не трогаем"],
    [rewrite("npx jest | grep x", fp) === null, "пайп не трогаем"],
  ];
  let ok = 0;
  for (const [pass, name] of cases) {
    if (pass) ok++;
    else console.log(`FAIL ${name}`);
  }
  console.log(`${ok}/${cases.length} ok`);
  process.exit(ok === cases.length ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  let raw = "";
  process.stdin.on("data", (d) => (raw += d));
  process.stdin.on("end", () => {
    try {
      const ev = JSON.parse(raw || "{}");
      const cmd = (ev.tool_input && ev.tool_input.command) || "";
      const filterPath = path.join(__dirname, "green-filter.js");
      const next = rewrite(cmd, filterPath);
      if (next) {
        process.stdout.write(
          JSON.stringify({
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "allow",
            },
            updatedInput: { command: next },
          })
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

