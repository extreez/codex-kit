#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если код менялся, а быстрый аудит
// изменённого не прогнан. Блокирует один раз — по stop_hook_active, чтобы
// не зациклиться.
//
// Смотрит git diff рабочего дерева. Есть изменённые код-файлы и это первый
// Stop — блокирует с напоминанием прогнать /sec-audit по изменённому. Второй
// Stop (stop_hook_active=true) пропускает: напомнили, решение за owner'ом.
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const { execFileSync } = require("child_process");

function isCodeFile(p) {
  return /\.(js|ts|jsx|tsx|py|rb|go|java|php|cs|rs|kt|swift|scala|c|cpp|sh)$/i.test(p);
}

function changedCodeFiles(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split(/\r?\n/).filter((l) => l && isCodeFile(l));
  } catch (_) {
    return []; // не git-репо или git недоступен — не мешаем
  }
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const cases = [
    ["src/api.js", true],
    ["main.py", true],
    ["notes.md", false],
    ["data.json", false],
    ["x.go", true],
    ["style.css", false],
  ];
  let ok = 0;
  for (const [p, want] of cases) {
    if (isCodeFile(p) === want) ok++;
    else console.log(`FAIL ${p}`);
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
      if (ev.stop_hook_active) process.exit(0); // уже напоминали
      const files = changedCodeFiles(ev.cwd || process.cwd());
      if (files.length) {
        const list = files.slice(0, 5).join(", ") + (files.length > 5 ? "…" : "");
        block(
          `Код менялся (${list}), аудит безопасности не прогнан. Прогони /sec-audit по изменённому или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

