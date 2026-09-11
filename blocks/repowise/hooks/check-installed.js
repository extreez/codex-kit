#!/usr/bin/env node
// SessionStart hook. Проверяет, стоит ли repowise на машине (pip-пакет),
// сам ничего не ставит — только сообщает агенту в начале сессии, чтобы
// SKILL.md не гадал и не лез в сеть без нужды. Тот же принцип, что
// context7/check-ctx7-version.js: информирует, не блокирует.
//
//   node check-installed.js              обычный запуск хуком
//   node check-installed.js --selftest   прогон над чистой функцией

const { execFileSync } = require("child_process");

function isInstalled() {
  try {
    execFileSync("repowise", ["--version"], { stdio: ["ignore", "ignore", "ignore"], timeout: 5000 });
    return true;
  } catch (_) {
    return false;
  }
}

function selftest() {
  // Чистой логики тут нет — проверяем, что функция не падает и возвращает bool.
  const r = isInstalled();
  console.log(typeof r === "boolean" ? "ok" : "FAIL");
  process.exit(typeof r === "boolean" ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  if (!isInstalled()) {
    console.log(
      "repowise не найден на этой машине. Первый вызов блока сам поставит: pip install repowise && repowise init --no-prose -y."
    );
  }
  process.exit(0);
}

