# codex-kit

Каталог из тех же 111 блоков и 10 стеков, что и `claude-kit`, адаптированный для Codex.

## Что изменено для Codex

- память проекта и шаблоны используют `AGENTS.md`;
- активные скиллы устанавливаются в `.agents/skills/`;
- команды блоков становятся обычными Codex-скиллами с именем `<блок>-<команда>`;
- Claude-only хуки сохраняются как исходник, но сами по себе не запускаются;
- MCP-конфиги и внешние CLI требуют отдельной настройки в Codex.

## Установка

Из корня проекта:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Block dev-build
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack dev
```

По умолчанию скиллы копируются в `.agents/skills/` текущего проекта. Для глобальной установки укажи `-Target "$HOME\.agents\skills"`.

Развернуть новый проект из стека:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -New -Stack dev -ProjectPath .\my-project
```

Если скилл уже существует, установка пропускает его; `-Force` разрешает замену.

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -List
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Doctor
```

Установка нового каталога скиллов может потребовать перезапуска сессии Codex.

## Codex marketplace

Репозиторий содержит Codex marketplace с плагином `codex-kit`:

```powershell
codex plugin marketplace add extreez/codex-kit --ref main
codex plugin add codex-kit@personal
```

Для локальной разработки подключи корень репозитория вместо `extreez/codex-kit`.
Защитный skill `kit` не включён в marketplace-плагин, потому что он предназначен
только для явного вызова. Для него используй локальный установщик выше.
