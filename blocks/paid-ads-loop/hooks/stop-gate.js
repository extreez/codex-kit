#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если в docs/marketing/
// paid-ads-tests.md есть тест с прошедшим плановым окончанием и
// пустой колонкой «Решение». Блокирует один раз — по stop_hook_active.
// Грубый построчный парсер markdown-таблицы, не полноценный парсер.
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const fs = require("fs");
const path = require("path");

const TRACKER_PATH = "docs/marketing/paid-ads-tests.md";

function parseRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|?\s*-+\s*\|/.test(line)) continue; // разделитель заголовка
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, arr) => !(i === 0 && arr[i] === "") && !(i === arr.length - 1 && arr[i] === ""));
    if (cells.length < 4) continue;
    if (cells[0] === "Тест" || cells[1] === "Платформа") continue; // заголовок
    rows.push({
      test: cells[0],
      plannedEnd: cells[3] || "",
      decision: cells[4] || "",
    });
  }
  return rows;
}

function findExpiredWithoutDecision(rows, now = new Date()) {
  const expired = [];
  for (const r of rows) {
    if (r.decision) continue;
    if (!r.plannedEnd) continue;
    const end = new Date(r.plannedEnd);
    if (isNaN(end.getTime())) continue;
    if (end.getTime() <= now.getTime()) expired.push(r.test);
  }
  return expired;
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const sample = `
| Тест | Платформа | Начало | Плановое окончание | Решение |
|---|---|---|---|---|
| Ещё идёт | Meta | 2026-09-01 | 2026-09-10 | |
| Истёк без решения | Meta | 2026-08-01 | 2026-08-15 | |
| Истёк с решением | Google | 2026-08-01 | 2026-08-15 | promote |
`;
  const rows = parseRows(sample);
  const now = new Date("2026-09-06");
  const expired = findExpiredWithoutDecision(rows, now);
  const ok = rows.length === 3 && expired.length === 1 && expired[0] === "Истёк без решения";
  console.log(ok ? "3/3 ok" : `FAIL: rows=${rows.length} expired=${JSON.stringify(expired)}`);
  process.exit(ok ? 0 : 1);
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
      const cwd = ev.cwd || process.cwd();
      const trackerFile = path.join(cwd, TRACKER_PATH);
      if (!fs.existsSync(trackerFile)) process.exit(0); // трекера ещё нет — нечего проверять
      const text = fs.readFileSync(trackerFile, "utf8");
      const expired = findExpiredWithoutDecision(parseRows(text));
      if (expired.length) {
        const list = expired.slice(0, 5).join(", ") + (expired.length > 5 ? "…" : "");
        block(
          `Тесты с истёкшим плановым окончанием без решения (${list}). Прогони metrics/analytics-readback или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

