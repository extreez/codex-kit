#!/usr/bin/env node
// Обёртка тест-раннера. Запускает переданную команду. Тесты зелёные (exit 0) —
// печатает одну строку сводки, полный вывод глотает. Красные (exit != 0) —
// печатает всё, чтобы агент видел, что упало.
//
// Смысл: зелёный прогон агенту читать незачем, он жрёт контекст. Падение —
// нужно целиком.
//
// Команда приходит в base64 (--b64 <...>), чтобы не терять кавычки при
// пересборке argv. Хук quiet-tests кодирует, обёртка декодирует и гонит через
// shell как есть.
//
//   node green-filter.js --b64 <base64-команды>   обычный запуск
//   node green-filter.js --selftest               прогон проверок над summarize()

const { spawnSync } = require("child_process");

// Из полного вывода зелёного прогона вытащить одну содержательную строку.
function summarize(output) {
  const lines = output.split(/\r?\n/).filter((l) => l.trim());
  const re = /(\d+\s+pass|passed|passing|ok\b|тест|PASS\b|\d+\s+of\s+\d+|Tests:.*pass)/i;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (re.test(lines[i])) return lines[i].trim();
  }
  return lines.length ? lines[lines.length - 1].trim() : "тесты зелёные";
}

function selftest() {
  const cases = [
    ["Tests: 12 passed, 12 total", "Tests: 12 passed, 12 total"],
    ["ok\n5 passed\n\n", "5 passed"],
    ["=== 3 passed in 0.2s ===", "=== 3 passed in 0.2s ==="],
    ["random\nlast line", "last line"],
    ["", "тесты зелёные"],
  ];
  let ok = 0;
  for (const [inp, want] of cases) {
    const got = summarize(inp);
    if (got === want) ok++;
    else console.log(`FAIL ${JSON.stringify(inp)} -> ${JSON.stringify(got)}`);
  }
  console.log(`${ok}/${cases.length} ok`);
  process.exit(ok === cases.length ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  const i = process.argv.indexOf("--b64");
  if (i < 0 || !process.argv[i + 1]) {
    console.error("green-filter: нет команды (--b64 <base64>)");
    process.exit(2);
  }
  const command = Buffer.from(process.argv[i + 1], "base64").toString("utf8");
  const r = spawnSync(command, { shell: true, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  if (r.status === 0) {
    console.log("✓ " + summarize(out) + " (полный вывод свёрнут green-filter)");
  } else {
    process.stdout.write(out);
  }
  process.exit(r.status === null ? 1 : r.status);
}

