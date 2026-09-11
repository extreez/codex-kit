#!/usr/bin/env node
// Stop hook. Не даёт закончить сессию, если менялись файлы воронки
// (регистрация/онбординг/paywall/попап/форма), а /cro-funnel по этой
// зоне не прогнан. Блокирует один раз — по stop_hook_active, чтобы не
// зациклиться. По образцу seo-loop/stop-gate.js.
//
//   node stop-gate.js              обычный запуск хуком
//   node stop-gate.js --selftest   прогон проверок над чистыми функциями

const { execFileSync } = require("child_process");

const FUNNEL_KEYWORDS = /signup|sign-up|onboard|checkout|paywall|popup|pricing|register|form/i;

function isFunnelFile(p) {
  return FUNNEL_KEYWORDS.test(p);
}

function changedFunnelFiles(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split(/\r?\n/).filter((l) => l && isFunnelFile(l));
  } catch (_) {
    return []; // не git-репо или git недоступен — не мешаем
  }
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const cases = [
    ["src/pages/signup.tsx", true],
    ["src/components/OnboardingWizard.jsx", true],
    ["src/checkout/CheckoutForm.vue", true],
    ["src/pricing/PaywallModal.tsx", true],
    ["src/api/handler.js", false],
    ["style.css", false],
    ["package.json", false],
  ];
  let ok = 0;
  for (const [p, want] of cases) {
    if (isFunnelFile(p) === want) ok++;
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
      const files = changedFunnelFiles(ev.cwd || process.cwd());
      if (files.length) {
        const list = files.slice(0, 5).join(", ") + (files.length > 5 ? "…" : "");
        block(
          `Файлы воронки менялись (${list}), /cro-funnel не прогнан. Прогони /cro-funnel по изменённой зоне или подтверди, что пропускаешь осознанно.`
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

