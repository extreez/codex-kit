# codex-kit

Каталог блоков и стеков, адаптированный для Codex.

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
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Skill gsap
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack dev
```

`-Skill` устанавливает один skill, например `gsap`. `-Block web-motion`
устанавливает весь связанный набор моушена. По умолчанию target равен
`.agents/skills` текущего проекта, для глобальной установки укажи
`-Target "$HOME\.agents\skills"` явно.

Видео-набор не входит в глобальный scope. Когда открыт корень видео-проекта,
подключи его целиком:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack video -Target .\.agents\skills
```

Развернуть новый проект из стека:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -New -Stack dev -ProjectPath .\my-project
```

Если скилл уже существует, установка пропускает его; `-Force` разрешает замену.

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -List
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Doctor
```

Для удаления одного установленного скилла используй `-Remove <name>`
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

Стек `video` устанавливает блок `hyperframes` с 26 скиллами и добавляет
вспомогательные блоки `video-pipeline` и `video-watch`. Сам проект при этом
не создаётся автоматически.

Установка нового каталога скиллов может потребовать перезапуска сессии Codex.

## Codex marketplace

Репозиторий содержит локальный Codex marketplace с плагином `codex-kit`.
Из корня репозитория подключи его:

```powershell
codex plugin marketplace add .
codex plugin add codex-kit@codex-kit-local
```

После этого перезапусти thread Codex. Менеджер включён в marketplace-плагин как
`codex-kit`, а не `kit`, чтобы не конфликтовать с legacy-набором для Claude.
