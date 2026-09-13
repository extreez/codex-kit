---
name: codex-kit
description: "Управляет Codex-kit и уровнями skills/plugins: устанавливает отдельные skills, блоки и стеки в проект, управляет глобальными plugins и проектными требованиями. Использовать по явной просьбе пользователя, а также при явном запросе на видео или HyperFrames в текущем проекте."
---

# codex-kit для Codex

Этот skill вызывается явно, кроме одного безопасного маршрута: когда пользователь
явно просит начать работу над видео или HyperFrames в уже открытом проекте.
Упоминание видео в обсуждении само по себе ничего не меняет.

## Видео в проекте

Если запрос действительно запускает видео-задачу, а текущая папка является корнем
проекта, автоматически примени проектный стек:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Stack video -Target .\.agents\skills
```

Установщик пропускает уже подключённые скиллы, поэтому повторный запуск безопасен.
`-Force`, глобальный target и создание нового проекта без отдельной просьбы не
используй. После подключения продолжай видео-задачу в том же проекте.

## Skills

Вызывай этот skill как `codex-kit`, не `kit`: имя `kit` занято legacy-набором
для Claude и не должно управлять Codex-kit.

Чтобы добавить один skill, используй `-Skill`. Например, `add gsap` должен
установить только `gsap`; `add web-motion` устанавливает весь блок моушена.

Используй `scripts/install.ps1` из репозитория Codex-kit:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Block <block> -Target <skills-dir>
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Skill <skill> -Target <skills-dir>
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Stack <stack> -Target <skills-dir>
```

Для глобального уровня используй `$HOME\.agents\skills`, для проекта
`<project>\.agents\skills`. `-Target` всегда указывает конкретный уровень.

## Plugins

Codex устанавливает plugins в глобальный `CODEX_HOME`. Настоящий project scope
для plugin пока не обещай. Управляй глобальным plugin через официальный CLI:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action list
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action add -Plugin <name>@<marketplace>
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action remove -Plugin <name>@<marketplace>
```

Проектное требование можно зафиксировать без изменения глобальной установки:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\plugins.ps1" -Action require -Plugin <name>@<marketplace> -ProjectPath <project>
```

Это создаёт `<project>\.codex-kit\plugins.json`. Он нужен для аудита и проверки
готовности проекта, но сам по себе не включает plugin в Codex Desktop.

После изменения установленного plugin начни новый thread Codex.
