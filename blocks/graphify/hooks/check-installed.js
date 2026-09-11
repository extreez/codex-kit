#!/usr/bin/env node
// SessionStart hook. Проверяет, стоит ли CLI graphify (PyPI-пакет graphifyy).
// Сам ничего не ставит — только сообщает агенту, чтобы SKILL.md не гадал.
//
//   node check-installed.js              обычный запуск хуком
//   node check-installed.js --selftest   прогон над чистой функцией

const { execFileSync } = require("child_process");

function isInstalled() {
  try {
    execFileSync("graphify", ["--version"], { stdio: ["ignore", "ignore", "ignore"], timeout: 5000 });
    return true;
  } catch (_) {
    return false;
  }
}

function selftest() {
  const r = isInstalled();
  console.log(typeof r === "boolean" ? "ok" : "FAIL");
  process.exit(typeof r === "boolean" ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  if (!isInstalled()) {
    console.log(
      "graphify не найден на этой машине. Первый вызов блока сам поставит: uv tool install graphifyy (или pipx/pip) && graphify install."
    );
  }
  process.exit(0);
}

