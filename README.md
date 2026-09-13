# codex-kit

`codex-kit` хранит большой каталог skills в GitHub, но не загружает его в
каждую сессию Codex. Marketplace plugin содержит только один manager-skill.
Он по явному запросу находит package в удалённом каталоге и ставит выбранный
skill, block или stack в `.agents/skills` текущего проекта.

## Как это работает

```text
codex-kit manager → git fetch каталога → sparse checkout выбранных путей
                  → .agents/skills проекта → skills доступны в проекте
```

Каждая установка получает точный Git commit, а
`.codex-kit/skills.lock.json` сохраняет источник, ref, commit и выбранные
packages. Поэтому проект воспроизводим, а глобальный каталог не раздувает
контекст.

## Установка manager

```powershell
codex plugin marketplace add extreez/codex-kit --ref main
codex plugin add codex-kit@personal
```

Перезапусти task Codex после установки plugin. В новой сессии будет доступен
один skill `codex-kit`, а не весь каталог.

## Использование в Codex

Попроси Codex, например: `codex-kit, найди gsap и подключи его к этому
проекту`, `подключи блок web-motion` или `добавь stack dev`.

Manager сначала ищет package в GitHub. Установка всегда идёт только в текущий
проект. Он не устанавливает skills глобально.

Для обновления выбранных packages: `codex-kit, обнови skills этого проекта`.
Для проверки: `codex-kit, проверь skills этого проекта`.

## Разработка каталога

`blocks/` и `stacks/` остаются источником правды. После изменения любого
`SKILL.md` или `stack.yaml` обнови индекс:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\catalog.ps1 -Write
powershell -ExecutionPolicy Bypass -File .\scripts\catalog.ps1 -Check
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Doctor
```

Локальный установщик также остаётся доступен для разработки и тестов:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Skill gsap -Target .\.agents\skills
```
