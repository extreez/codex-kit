---
name: codex-kit
description: "По явному запросу ищет packages Codex-kit в GitHub и устанавливает только выбранный skill, block или stack в текущий проект."
---

# Codex-kit manager

Вызывай этот skill только когда пользователь явно просит найти, добавить,
обновить или проверить package Codex-kit. Не устанавливай ничего глобально.
Каждая установка идёт в `<project>/.agents/skills` и записывается в
`<project>/.codex-kit/skills.lock.json`.

Сначала найди bundled runner. Он хранится вместе с этим единственным skill и
не зависит от checkout репозитория:

```powershell
$roots = @((Join-Path $env:USERPROFILE '.codex\plugins\cache'))
if ($env:CODEX_HOME) { $roots += Join-Path $env:CODEX_HOME 'plugins\cache' }
$runner = $roots | Where-Object { Test-Path -LiteralPath $_ } | ForEach-Object {
  Get-ChildItem -LiteralPath $_ -Recurse -File -Filter 'remote-install.ps1' -ErrorAction SilentlyContinue
} | Where-Object { $_.FullName -match '[\\/]codex-kit[\\/]' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $runner) { throw 'Codex-kit manager runner was not found. Reinstall codex-kit@personal.' }
```

Затем используй runner:

```powershell
& $runner.FullName -Action search -Query gsap
& $runner.FullName -Action add -Name gsap -Kind skill
& $runner.FullName -Action add -Name web-motion -Kind block
& $runner.FullName -Action add -Name dev -Kind stack
& $runner.FullName -Action update
& $runner.FullName -Action doctor
```

`search` только получает каталог из GitHub. `add` делает shallow fetch
закреплённого Git commit, sparse checkout нужных путей и запускает проверенный
установщик из этого snapshot. При нескольких совпадениях сначала покажи
результаты поиска, затем попроси пользователя выбрать `skill`, `block` или
`stack`.

После установки продолжай исходную задачу в этом же проекте. Новый thread не
нужен: project skills будут доступны следующему ходу агента.
