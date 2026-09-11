#!/usr/bin/env node
// UserPromptSubmit hook. Проектный, не глобальный: срабатывает только там,
// где блок dev-build реально подключён — в отличие от общего детектора
// пользователя (~/.agents/hooks/detector.js), который живёт вне блока и
// нельзя привязать к конкретному проекту без риска подсказать команду,
// которой в этом проекте нет.
//
// Смотрит форму запроса (регексы), не смысл. Совпало и раньше не
// показывали в этой сессии — одна строка. Не совпало — молчит. Состояние
// хранится в проекте (${cwd}/.agents/.dev-build-nudge.json), не трогает
// глобальные файлы пользователя.
//
//   node nudge.js                 обычный запуск хуком, JSON на stdin
//   node nudge.js --test "текст"  печатает true/false
//   node nudge.js --selftest      прогон встроенных проверок

const fs = require("fs");
const path = require("path");

const MIN_WORDS = 4;
const HEAD_CHARS = 400;
const TIP =
  "тут просится нарезка спеки на срезы, сказать `/dev-build` (или `/dev-build научи`, если нужно объяснение)";

// (?<...>) без \b и \w: те не видят кириллицу. Граница слова — своя.
// Каждая группа — список регексов, совпасть должны все, но не подряд:
// «реализуй фичу оплаты по спеке» — глагол и «спек» далеко друг от друга.
const SIGNALS = [
  [/(реализ|сдела)[а-яё]*/iu, /спек/iu],
  [/разб[а-яё]*/iu, /тикет/iu],
  [/(?<![а-яё])(tdd|тдд)(?![а-яё])/iu],
  [/нарежь?[а-яё]*/iu, /(срез|шаг)/iu],
  [/сплани[а-яё]*/iu, /сборк/iu],
];

const MUTE = [
  /^\s*(что такое|как работает|почему|объясни|расскажи|в чём разниц)/iu,
  /^\s*(да|нет|ок|окей|делай|продолжай|давай|привет|спасибо)\s*[.!]?\s*$/iu,
];

function match(prompt) {
  const text = prompt
    .trim()
    .replace(/https?:\/\/\S+/gu, " ")
    .slice(0, HEAD_CHARS);
  if (text.split(/\s+/).length < MIN_WORDS) return false;
  if (MUTE.some((rx) => rx.test(text))) return false;
  return SIGNALS.some((group) => group.every((rx) => rx.test(text)));
}

function statePath(cwd) {
  return path.join(cwd, ".claude", ".dev-build-nudge.json");
}

function alreadyShown(cwd, sessionId) {
  try {
    const state = JSON.parse(fs.readFileSync(statePath(cwd), "utf8"));
    return (state.sessions || []).includes(sessionId);
  } catch (_) {
    return false;
  }
}

function remember(cwd, sessionId) {
  const file = statePath(cwd);
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_) {
    // файла ещё нет — заводим
  }
  const sessions = [...new Set([...(state.sessions || []), sessionId])].slice(-20);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ sessions }, null, 2), "utf8");
  } catch (_) {
    // не записалось — подсказка повторится, не повод падать
  }
}

function selftest() {
  const cases = [
    ["реализуй фичу оплаты по спеке из тикета", true],
    ["разбей тикет на шаги пожалуйста", true],
    ["начать TDD для нового модуля", true],
    ["почини опечатку в заголовке", false],
    ["что такое TDD", false],
    ["привет", false],
    ["да", false],
  ];
  let bad = 0;
  for (const [text, want] of cases) {
    const got = match(text);
    if (got !== want) {
      bad++;
      console.log(`FAIL "${text}" -> ${got}, ждали ${want}`);
    }
  }
  console.log(bad === 0 ? `все ${cases.length} прошли` : `провалов: ${bad}`);
  process.exit(bad === 0 ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else if (process.argv[2] === "--test") {
  console.log(match(process.argv.slice(3).join(" ")));
} else {
  let raw = "";
  process.stdin.on("data", (d) => (raw += d));
  process.stdin.on("end", () => {
    try {
      const ev = JSON.parse(raw || "{}");
      const prompt = typeof ev.prompt === "string" ? ev.prompt : "";
      const cwd = ev.cwd || process.cwd();
      const sessionId = ev.session_id || "нет-сессии";
      if (prompt && match(prompt) && !alreadyShown(cwd, sessionId)) {
        remember(cwd, sessionId);
        process.stdout.write(JSON.stringify({ systemMessage: TIP, suppressOutput: true }));
      }
    } catch (_) {
      // молча пропускаем — хук не должен ронять сессию
    }
    process.exit(0);
  });
}

