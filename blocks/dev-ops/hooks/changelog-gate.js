#!/usr/bin/env node
// Stop hook. Список зависимостей поменялся в этой сессии, а CHANGELOG —
// нет: напомнить один раз. Блокирует один раз — по stop_hook_active, чтобы
// не зациклиться. Тот же механизм, что sec-loop/stop-gate.js и
// dev-loop/stop-gate.js, другой признак.
//
//   node changelog-gate.js              обычный запуск хуком
//   node changelog-gate.js --selftest   прогон проверок над чистыми функциями

const { execFileSync } = require("child_process");

const MANIFESTS = /(^|[\/\\])(package\.json|requirements\.txt|pyproject\.toml|go\.mod|Gemfile|Cargo\.toml|composer\.json)$/i;
const CHANGELOG = /(^|[\/\\])CHANGELOG(\.md)?$/i;

function changedFiles(cwd) {
  try {
    const out = execFileSync("git", ["diff", "--name-only", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (_) {
    return []; // не git-репо или git недоступен — не мешаем
  }
}

function shouldRemind(files) {
  const manifestChanged = files.some((f) => MANIFESTS.test(f));
  const changelogChanged = files.some((f) => CHANGELOG.test(f));
  return manifestChanged && !changelogChanged;
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
}

function selftest() {
  const cases = [
    [["package.json", "src/a.js"], true],
    [["package.json", "CHANGELOG.md"], false],
    [["src/a.js", "src/b.js"], false],
    [["requirements.txt"], true],
    [["CHANGELOG.md"], false],
    [[], false],
  ];
  let ok = 0;
  for (const [files, want] of cases) {
    if (shouldRemind(files) === want) ok++;
    else console.log(`FAIL ${JSON.stringify(files)}`);
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
      const files = changedFiles(ev.cwd || process.cwd());
      if (shouldRemind(files)) {
        block(
          "Список зависимостей поменялся, CHANGELOG — нет. Дописать запись или подтвердить, что пропускаешь осознанно."
        );
      }
    } catch (_) {
      // молча пропускаем
    }
    process.exit(0);
  });
}

