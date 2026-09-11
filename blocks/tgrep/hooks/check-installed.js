#!/usr/bin/env node
// SessionStart hook. Говорит агенту одной строкой, в каком состоянии tgrep:
// не стоит / стоит, но индекса нет / индекс есть. Сам ничего не ставит и не
// строит. Решение о постройке индекса принимает SKILL.md по порогу файлов.
// Тот же принцип, что repowise/check-installed.js: информирует, не блокирует.
//
//   node check-installed.js              обычный запуск хуком
//   node check-installed.js --selftest   прогон над чистой функцией

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function isInstalled() {
  try {
    execFileSync("tgrep", ["--version"], { stdio: ["ignore", "ignore", "ignore"], timeout: 5000 });
    return true;
  } catch (_) {
    return false;
  }
}

function hasIndex(root) {
  try {
    return fs.existsSync(path.join(root, ".tgrep"));
  } catch (_) {
    return false;
  }
}

function message(installed, indexed) {
  if (!installed) {
    return "tgrep не найден на этой машине. Нужен только на крупном репозитории (от ~15 000 файлов). Скилл tgrep скажет, ставить или нет.";
  }
  if (!indexed) {
    return "tgrep стоит, индекса в этом проекте нет. Строить только если файлов от ~15 000: tgrep index .";
  }
  return "tgrep стоит, индекс проекта есть. Подними сервер один раз за сессию: tgrep serve . &";
}

function selftest() {
  const cases = [
    [false, false, "не найден"],
    [true, false, "индекса в этом проекте нет"],
    [true, true, "индекс проекта есть"],
  ];
  let ok = 0;
  for (const [inst, idx, needle] of cases) {
    const m = message(inst, idx);
    if (m.includes(needle)) ok++;
    else console.log(`FAIL ${inst}/${idx} -> ${m}`);
  }
  // hasIndex не должен падать на несуществующем пути
  const safe = typeof hasIndex(path.join(__dirname, "нет-такой-папки")) === "boolean";
  if (safe) ok++;
  else console.log("FAIL hasIndex не вернул bool");
  console.log(`${ok}/${cases.length + 1} ok`);
  process.exit(ok === cases.length + 1 ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  const root = process.cwd();
  console.log(message(isInstalled(), hasIndex(root)));
  process.exit(0);
}

