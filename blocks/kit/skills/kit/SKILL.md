---
name: codex-kit
description: "Управляет каталогом Codex-kit: устанавливает отдельные skills, блоки и стеки в .agents/skills, а также проверяет каталог. Использовать по явной просьбе о Codex-kit, skill, блоке или стеке, а также при явном запросе на видео или HyperFrames в текущем проекте."
---

# codex-kit — управление Codex-kit

Codex-kit — каталог блоков, а `.agents/skills` — рабочее место активных скиллов.
Сам по себе этот скилл ничего не подключает и не удаляет, кроме одного маршрута:
при явном запросе на видео или HyperFrames в уже открытом проекте автоматически
примени проектный стек `video`. Упоминание видео в обсуждении само по себе ничего
не меняет.

## Видео в проекте

Используй из корня текущего проекта:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Stack video -Target .\.agents\skills
```

Установщик пропускает уже подключённые скиллы. Не используй `-Force`, глобальный
target или создание нового проекта без отдельной просьбы пользователя.

## Команды

Вызывай этот skill как `codex-kit`, не `kit`: имя `kit` занято legacy-набором
для Claude и не должно управлять Codex-kit.

Все операции установки выполняй установщиком из каталога:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" <параметры>
```

- `list` — передай `-List`;
- `add <имя>` — если это блок, передай `-Block <имя>`; если это отдельный skill,
  передай `-Skill <имя>`. Например, `add gsap` устанавливает только `gsap`, а
  `add web-motion` устанавливает весь блок моушена;
- `apply <стек>` — передай `-Stack <стек>`;
- `doctor` — передай `-Doctor`;
- `remove <имя>` — удали только установленный каталог `.agents/skills/<имя>` после подтверждения имени и пути;
- `new <стек>` — передай установщику `-New -Stack <стек> -ProjectPath <путь>`;
- `temp <блок>` и `try <кандидат>` — установи в отдельный временный `-Target`, не в рабочий `.agents/skills`.

Для видео-проекта используй готовый стек `video` из корня этого проекта:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\Codex-kit\scripts\install.ps1" -Stack video -Target .\.agents\skills
```

Он подключает проектный блок `hyperframes` со всеми 26 видео-скиллами и
вспомогательные блоки `video-pipeline` и `video-watch`. Видео-набор не нужно
держать в глобальном `.agents/skills`.

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
