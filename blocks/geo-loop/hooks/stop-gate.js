#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если менялись страницы/шаблоны/
// llms.txt, а GEO-оценка изменённого не прогнана. Блокирует один раз —
// по stop_hook_active, чтобы не зациклиться.
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const { execFileSync } = require("child_process");

function isGeoRelevantFile(p) {
  return /\.(html|htm|astro|vue|jsx|tsx|njk|hbs|liquid|md|mdx|php)$/i.test(p) ||
    /llms(-full)?\.txt$|robots\.txt$/i.test(p);
}

function changedGeoFiles(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split(/\r?\n/).filter((l) => l && isGeoRelevantFile(l));
  } catch (_) {
    return []; // не git-репо или git недоступен — не мешаем
  }
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const cases = [
    ["src/pages/index.astro", true],
    ["public/llms.txt", true],
    ["public/llms-full.txt", true],
    ["public/robots.txt", true],
    ["content/post.mdx", true],
    ["src/api/handler.js", false],
    ["style.css", false],
  ];
  let ok = 0;
  for (const [p, want] of cases) {
    if (isGeoRelevantFile(p) === want) ok++;
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
      const files = changedGeoFiles(ev.cwd || process.cwd());
      if (files.length) {
        const list = files.slice(0, 5).join(", ") + (files.length > 5 ? "…" : "");
        block(
          `Страницы/llms.txt менялись (${list}), GEO-оценка не прогнана. Прогони /geo-optimize по изменённому или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

