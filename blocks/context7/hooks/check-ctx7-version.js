#!/usr/bin/env node
// SessionStart hook. Сверяет версию ctx7 на npm с той, что зафиксирована
// при последней синхронизации SKILL.md (skills/find-docs/.ctx7-version).
// Разошлись — печатает напоминание сверить SKILL.md с апстримом. Сам файл
// не трогает: он в git codex-kit, тихая перезапись затёрла бы правки.
//
//   node check-ctx7-version.js              обычный запуск хуком
//   node check-ctx7-version.js --selftest   прогон сравнения версий

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PINNED_FILE = path.join(__dirname, "..", "skills", "find-docs", ".ctx7-version");

function pinnedVersion() {
  try {
    return fs.readFileSync(PINNED_FILE, "utf8").trim();
  } catch (_) {
    return null;
  }
}

function latestVersion() {
  try {
    return execFileSync("npm", ["view", "ctx7", "version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
  } catch (_) {
    return null; // офлайн или npm недоступен — не мешаем
  }
}

function outdated(pinned, latest) {
  return Boolean(pinned && latest && pinned !== latest);
}

function selftest() {
  const cases = [
    [["0.5.9", "0.5.9"], false],
    [["0.5.9", "0.6.0"], true],
    [[null, "0.6.0"], false],
    [["0.5.9", null], false],
  ];
  let ok = 0;
  for (const [[p, l], want] of cases) {
    if (outdated(p, l) === want) ok++;
    else console.log(`FAIL pinned=${p} latest=${l}`);
  }
  console.log(`${ok}/${cases.length} ok`);
  process.exit(ok === cases.length ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  const pinned = pinnedVersion();
  const latest = latestVersion();
  if (outdated(pinned, latest)) {
    console.log(
      `context7: на npm ctx7@${latest}, в блоке зафиксирован ${pinned}. Прогони "npx ctx7 setup --claude --cli -y" в отдельной папке и сверь SKILL.md с blocks/context7/skills/find-docs/SKILL.md.`
    );
  }
  process.exit(0);
}

