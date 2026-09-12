---
name: kit
description: "Управляет каталогом Codex-kit: показывает блоки, устанавливает блоки и стеки в .agents/skills и проверяет каталог. Использовать по явной просьбе о Codex-kit, блоке или стеке."
---

# kit — управление Codex-kit

Codex-kit — каталог блоков, а `.agents/skills` — рабочее место активных скиллов.
Сам по себе этот скилл ничего не подключает и не удаляет: выполняй изменение
только по явной команде пользователя.

## Команды

Все операции установки выполняй установщиком из каталога:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" <параметры>
```

- `list` — передай `-List`;
- `add <блок>` — передай `-Block <блок>`;
- `apply <стек>` — передай `-Stack <стек>`;
- `doctor` — передай `-Doctor`;
- `remove <имя>` — удали только установленный каталог `.agents/skills/<имя>` после подтверждения имени и пути;
- `new <стек>` — передай установщику `-New -Stack <стек> -ProjectPath <путь>`;
- `temp <блок>` и `try <кандидат>` — установи в отдельный временный `-Target`, не в рабочий `.agents/skills`.

Перед `add` и `apply` прочитай `block.yaml` и `CONFLICTS.md`: `needs` — обязательные
зависимости, `suggests` — только рекомендации, конфликтующие блоки не ставь без
явного `--force`-решения пользователя. Не замещай существующий скилл молча.

Команды из исходного блока превращаются установщиком в скиллы `<блок>-<команда>`.
Хуки исходного движка и `.mcp.json` не запускаются как Codex-механизмы; для них сначала
нужна отдельная Codex-настройка.

После установки нового каталога скиллов перезапусти сессию Codex, если он ещё не
видит `.agents/skills`.

## Plugins Codex

Для глобальных plugins используй `scripts/plugins.ps1`, который вызывает
официальный `codex plugin`:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action list
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action add -Plugin <name>@<marketplace>
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action remove -Plugin <name>@<marketplace>
```

Настоящий project scope для plugins не заявляй. Для проекта можно записать
требование в `<project>\.codex-kit\plugins.json` через `-Action require`; это
нужно для аудита и проверки, но не включает plugin в Codex Desktop.
