---
name: kit
description: "Управляет Codex-kit и уровнями skills/plugins: показывает состояние, устанавливает skills глобально или в проект, управляет глобальными plugins и проектными требованиями. Использовать только по явной просьбе пользователя."
---

# kit для Codex

Этот skill вызывается явно. Он не устанавливает и не удаляет ничего сам по себе.

## Skills

Используй `scripts/install.ps1` из репозитория Codex-kit:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Documents\codex-kit\scripts\install.ps1" -Block <block> -Target <skills-dir>
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
