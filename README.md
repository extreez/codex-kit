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

Для удаления одного глобально установленного скилла используй `-Remove <name>`
с тем же `-Target`. Команда принимает только имя каталога и не смешивается с
другими операциями.

Управление plugins выполняется отдельным Codex-совместимым скриптом:

```powershell
# список глобальных plugins
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action list

# установить или удалить глобальный plugin
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action add -Plugin github@openai-curated
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action remove -Plugin github@openai-curated

# записать plugin как требование конкретного проекта
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action require -Plugin figma@openai-curated -ProjectPath .
```

Skills имеют настоящий project scope через `.agents/skills`. Plugins пока
устанавливаются глобально через `codex plugin`; файл `.codex-kit/plugins.json`
фиксирует проектные требования и проверяет их, но не подменяет механизм Codex.

Short scope recipe:

```powershell
# global user scope
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack dev

# existing project scope
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack interface -Target .\.agents\skills

# create a new project with a stack
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -New -Stack interface -ProjectPath .\my-project

# remove one skill from a chosen scope
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Remove interface-router -Target .\.agents\skills
```

Установка нового каталога скиллов может потребовать перезапуска сессии Codex.

## Codex marketplace

Репозиторий содержит Codex marketplace с плагином `codex-kit`:

```powershell
codex plugin marketplace add extreez/codex-kit --ref main
codex plugin add codex-kit@personal
```

Для локальной разработки подключи корень репозитория вместо `extreez/codex-kit`.
Skill `kit` включён в Codex marketplace-плагин, но помечен как доступный только
при явном вызове.
