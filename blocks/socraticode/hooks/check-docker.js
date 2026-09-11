#!/usr/bin/env node
// SessionStart hook. socraticode держит Qdrant и Ollama в Docker-контейнерах —
// без запущенного Docker MCP-сервер не поднимется. Сообщает один раз при
// старте сессии, не блокирует: Docker включает пользователь сам, агент за
// него это не сделает.
//
//   node check-docker.js              обычный запуск хуком
//   node check-docker.js --selftest   прогон над чистой функцией

const { execFileSync } = require("child_process");

function dockerRunning() {
  try {
    execFileSync("docker", ["info"], { stdio: ["ignore", "ignore", "ignore"], timeout: 5000 });
    return true;
  } catch (_) {
    return false;
  }
}

function selftest() {
  const r = dockerRunning();
  console.log(typeof r === "boolean" ? "ok" : "FAIL");
  process.exit(typeof r === "boolean" ? 0 : 1);
}

if (process.argv.includes("--selftest")) {
  selftest();
} else {
  if (!dockerRunning()) {
    console.log(
      "socraticode: Docker не запущен (нужен для Qdrant/Ollama внутри MCP-сервера). Запусти Docker перед первым использованием."
    );
  }
  process.exit(0);
}

