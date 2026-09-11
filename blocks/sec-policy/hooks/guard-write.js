#!/usr/bin/env node
// PreToolUse hook, matcher Edit|Write|MultiEdit.
// Бьёт по руке в момент записи, до коммита. secret-scan.js на git push —
// внешний компонент, не входит в этот набор блоков.
//
// Блокирует:
//   - приватный ключ или высокоэнтропийный токен в код-файл (не .env/пример)
//   - правку .env без явного маркера подтверждения в содержимом
//   - явные небезопасные паттерны из чеклиста sec-policy (CORS *, SQL-склейка,
//     тип файла по расширению, innerHTML с переменной)
//
// Формат: PreToolUse JSON на stdin -> при находке JSON permissionDecision:"deny".
// Язык-агностик: паттерны текстовые, не привязаны к фреймворку.
//
//   node guard-write.js              обычный запуск хуком
//   node guard-write.js --selftest   прогон встроенных проверок

const CONFIRM_MARKER = "SEC-POLICY-OK"; // пишешь в content, чтобы обойти осознанно

function isEnvFile(p) {
  return /(^|[\/\\])\.env(\.|$)/.test(p) && !/\.example$|\.sample$|\.template$/.test(p);
}

function isCodeFile(p) {
  return /\.(js|ts|jsx|tsx|py|rb|go|java|php|cs|rs|kt|swift|scala|c|cpp|sh|yaml|yml|json|env)$/i.test(p);
}

// json/yaml/yml часто несут поля вида token/secret как имя настройки, не
// утечку (lock-файлы, CI-конфиги) — им нужен порог энтропии выше, чем коду.
function isDataConfigFile(p) {
  return /\.(json|yaml|yml)$/i.test(p);
}

// Заголовок приватного ключа — почти нет ложных срабатываний.
function hasPrivateKey(text) {
  return /-----BEGIN (RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/.test(text);
}

// Присвоение секрета литералом: KEY = "длинная-строка". Ловим только явные имена.
function findHardcodedSecret(text, entropyThreshold) {
  const threshold = entropyThreshold == null ? 3.2 : entropyThreshold;
  const re = /(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?key|private[_-]?key|bearer)\s*[:=]\s*["'`]([A-Za-z0-9_\-\.\/+=]{16,})["'`]/gi;
  let m;
  while ((m = re.exec(text))) {
    const val = m[1];
    // Пропускаем очевидные плейсхолдеры.
    if (/^(your|xxx|placeholder|changeme|example|test|dummy|process\.env|import\.meta|\$\{)/i.test(val)) continue;
    if (/^(true|false|null|undefined)$/i.test(val)) continue;
    if (shannonEntropy(val) < threshold) continue; // слово, не токен
    return val.slice(0, 6) + "…";
  }
  return null;
}

function shannonEntropy(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  let e = 0;
  for (const ch in freq) {
    const p = freq[ch] / s.length;
    e -= p * Math.log2(p);
  }
  return e;
}

// Небезопасные паттерны из чеклиста. Консервативно: только явное.
function findUnsafePattern(text) {
  const checks = [
    [/Access-Control-Allow-Origin["'`\s:]*[=:]\s*["'`]\*["'`]/i, "EX-2: CORS wildcard '*'. Список конкретных доменов."],
    [/origin\s*:\s*["'`]\*["'`]/i, "EX-2: CORS origin '*'. Список конкретных доменов."],
    [/cors\(\s*\)/i, "EX-2: cors() без опций = разрешить всё. Задай origin."],
    // SQL-склейка: SELECT ... + переменная, или шаблон с ${} внутри строки запроса
    [/(SELECT|INSERT|UPDATE|DELETE)\b[^;'"`]*["'`]\s*\+\s*\w/i, "IN-1: SQL склейкой строк. Параметризованный запрос или ORM."],
    [/(SELECT|INSERT|UPDATE|DELETE)\b[^;]*`[^`]*\$\{/i, "IN-1: SQL с интерполяцией. Параметризованный запрос или ORM."],
    [/\.(innerHTML|outerHTML)\s*=\s*[^"'`]*\w/i, "IN-2: innerHTML с переменной. Экранируй или textContent."],
    [/dangerouslySetInnerHTML/i, "IN-2: dangerouslySetInnerHTML. Экранируй ввод пользователя."],
    // Тип файла по расширению
    [/\.(originalname|filename|name)\b[^;]*\.(endsWith|match)\s*\([^)]*\.(png|jpg|jpeg|gif|pdf|svg)/i, "UP-1: тип файла по расширению. Проверяй по сигнатуре содержимого."],
  ];
  for (const [re, msg] of checks) {
    if (re.test(text)) return msg;
  }
  return null;
}

function evaluate(toolName, input) {
  if (!/^(Edit|Write|MultiEdit)$/.test(toolName)) return null;
  const path = input.file_path || input.path || "";
  // Собираем весь записываемый текст.
  let text = input.content || input.new_string || "";
  if (Array.isArray(input.edits)) text += "\n" + input.edits.map((e) => e.new_string || "").join("\n");
  if (!text) return null;

  if (text.includes(CONFIRM_MARKER)) return null; // осознанный обход owner'ом

  if (isEnvFile(path)) {
    return `Правка ${path}: файл секретов только для чтения (SE-1/SE-2). Меняй руками или добавь в content маркер ${CONFIRM_MARKER}.`;
  }

  if (isCodeFile(path)) {
    if (hasPrivateKey(text)) return `SE-1: приватный ключ в ${path}. Секреты держи в .env, не в коде.`;
    const secret = findHardcodedSecret(text, isDataConfigFile(path) ? 4.0 : 3.2);
    if (secret) return `SE-1: похоже на секрет (${secret}) в коде ${path}. Вынеси в переменную окружения.`;
  }

  const unsafe = findUnsafePattern(text);
  if (unsafe) return `${unsafe} (файл ${path}). Обойти осознанно: маркер ${CONFIRM_MARKER} в содержимом.`;

  return null;
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
}

// --- selftest ---
function selftest() {
  const cases = [
    ["Write", { file_path: "a.js", content: 'const x = 1;' }, false],
    ["Write", { file_path: "a.js", content: 'const apiKey = "' + ["AKIA", "IOSFODNN7EXAMPLE1234"].join("") + '";' }, true],
    ["Write", { file_path: "a.js", content: 'const apiKey = process.env.API_KEY;' }, false],
    ["Write", { file_path: ".env", content: 'API_KEY=abc' }, true],
    ["Write", { file_path: ".env.example", content: 'API_KEY=your-key' }, false],
    ["Edit", { file_path: "s.js", new_string: 'app.use(cors())' }, true],
    ["Edit", { file_path: "s.js", new_string: 'db.query("SELECT * FROM u WHERE id=" + id)' }, true],
    ["Edit", { file_path: "s.js", new_string: 'el.innerHTML = userInput' }, true],
    ["Write", { file_path: "readme.md", content: 'password: secret123456789abc' }, false],
    ["Write", { file_path: "a.js", content: 'const apiKey = "AKIAIOSFODNN7"; // SEC-POLICY-OK' }, false],
  ];
  let ok = 0;
  for (const [tool, input, shouldBlock] of cases) {
    const r = evaluate(tool, input);
    const blocked = r !== null;
    const pass = blocked === shouldBlock;
    if (pass) ok++;
    else console.log(`FAIL ${tool} ${JSON.stringify(input).slice(0, 50)} -> ${r}`);
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
      const reason = evaluate(ev.tool_name || "", ev.tool_input || {});
      if (reason) deny(reason);
    } catch (_) {
      // молча пропускаем — хук не должен ронять сессию
    }
    process.exit(0);
  });
}

