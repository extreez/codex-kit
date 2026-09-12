# Адаптация claude-kit для Codex

Источник: `C:\Users\supga\Documents\claude-kit`.

Каталог сохраняет `block.yaml`, `CONFLICTS.md`, `library`, `stacks` и `apps`. Содержимое `SKILL.md` портировано механической заменой платформенных путей и названий там, где это безопасно. Хуки исходного движка не считаются активными Codex-механизмами. Команды преобразуются установщиком в отдельные скиллы.

Для нового Codex-проекта используй стек как шаблон файлов, затем установи его блоки:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack research
```

В Codex project scope для skills реализован через `.agents/skills`. Для plugins
текущий runtime использует глобальный `CODEX_HOME`, поэтому Codex-kit хранит
проектные plugin-требования в `.codex-kit/plugins.json` и проверяет их отдельно.
