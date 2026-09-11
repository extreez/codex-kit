#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если в docs/marketing/
// content-pipeline.md есть материал со Stage=PUBLISHED старше
// readback-окна (по умолчанию 14 дней) без записи в колонке Readback.
// Блокирует один раз — по stop_hook_active. Грубый построчный парсер
// markdown-таблицы, не полноценный парсер — нестандартный формат строки
// может быть пропущен, это нормально (не строгая проверка).
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const fs = require("fs");
const path = require("path");

const READBACK_WINDOW_DAYS = 14;
const TRACKER_PATH = "docs/marketing/content-pipeline.md";

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
    if (cells[0] === "Тема" || cells[1] === "Stage") continue; // заголовок
    rows.push({
      topic: cells[0],
      stage: cells[1],
      publishedAt: cells[3] || "",
      readback: cells[4] || "",
    });
  }
  return rows;
}

function findOverdueReadback(rows, now = new Date(), windowDays = READBACK_WINDOW_DAYS) {
  const overdue = [];
  for (const r of rows) {
    if (r.stage !== "PUBLISHED") continue;
    if (r.readback) continue;
    if (!r.publishedAt) continue;
    const published = new Date(r.publishedAt);
    if (isNaN(published.getTime())) continue;
    const days = (now.getTime() - published.getTime()) / 86400000;
    if (days >= windowDays) overdue.push(r.topic);
  }
  return overdue;
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const sample = `
| Тема | Stage | Дата входа в стадию | Дата публикации | Readback |
|---|---|---|---|---|
| Свежая статья | PUBLISHED | 2026-09-01 | 2026-09-01 | |
| Старая без readback | PUBLISHED | 2026-08-01 | 2026-08-01 | |
| Старая с readback | PUBLISHED | 2026-08-01 | 2026-08-01 | readback-log#3 |
| В работе | DRAFT | 2026-09-04 | | |
`;
  const rows = parseRows(sample);
  const now = new Date("2026-09-06");
  const overdue = findOverdueReadback(rows, now);
  const ok = rows.length === 4 && overdue.length === 1 && overdue[0] === "Старая без readback";
  console.log(ok ? "4/4 ok" : `FAIL: rows=${rows.length} overdue=${JSON.stringify(overdue)}`);
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
      const overdue = findOverdueReadback(parseRows(text));
      if (overdue.length) {
        const list = overdue.slice(0, 5).join(", ") + (overdue.length > 5 ? "…" : "");
        block(
          `Опубликовано более ${READBACK_WINDOW_DAYS} дней назад без readback (${list}). Прогони metrics/analytics-readback или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

