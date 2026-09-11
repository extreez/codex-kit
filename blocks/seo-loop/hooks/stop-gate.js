#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если менялись страницы/шаблоны, а
// SEO-аудит изменённого не прогнан. Блокирует один раз — по stop_hook_active,
// чтобы не зациклиться.
//
// Смотрит git diff рабочего дерева. Есть изменённые файлы страниц/шаблонов и
// это первый Stop — блокирует с напоминанием прогнать /seo-audit по
// изменённому. Второй Stop (stop_hook_active=true) пропускает: напомнили,
// решение за owner'ом.
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const { execFileSync } = require("child_process");

function isPageFile(p) {
  return /\.(html|htm|astro|vue|jsx|tsx|njk|hbs|liquid|md|mdx|php)$/i.test(p) ||
    /sitemap\.xml$|robots\.txt$/i.test(p);
}

function changedPageFiles(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split(/\r?\n/).filter((l) => l && isPageFile(l));
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
    ["public/sitemap.xml", true],
    ["public/robots.txt", true],
    ["content/post.mdx", true],
    ["src/api/handler.js", false],
    ["style.css", false],
    ["package.json", false],
  ];
  let ok = 0;
  for (const [p, want] of cases) {
    if (isPageFile(p) === want) ok++;
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
      const files = changedPageFiles(ev.cwd || process.cwd());
      if (files.length) {
        const list = files.slice(0, 5).join(", ") + (files.length > 5 ? "…" : "");
        block(
          `Страницы/шаблоны менялись (${list}), SEO-аудит не прогнан. Прогони /seo-audit по изменённому или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

