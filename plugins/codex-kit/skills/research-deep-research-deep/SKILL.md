---
name: research-deep-research-deep
description: "Codex skill generated from block command research-deep."
---

---
description: Запустить глубокое исследование вопроса
argument-hint: "[тир: light|full|dissertation, по умолчанию определяется по вопросу]"
---

Запусти исследование по скиллу `research-deep`.

Аргумент `$ARGUMENTS`: тир глубины, если пользователь его уже знает. Пусто -
определи тир сам по формулировке `docs/question.md` и предложи как дефолт,
дай пользователю поправить.

Обязательно по порядку:
1. `docs/question.md` не заполнен (TODO или общая фраза вместо проверяемого
   критерия) - сначала заполни его вместе с пользователем, без него строить
   не из чего.
2. Спроси модель и эффорт под `research-investigator`, `research-critic`,
   `research-patcher` (правило, не пропускай).
3. Декомпозиция -> параллельные `research-investigator` -> склейка дублирующихся
   источников -> черновик синтеза -> состязательные `research-critic` (проверь
   dialogue health, если все `clean` - переспроси строже) -> `research-patcher`
   точечно по находкам -> `fact-check` черновика -> отчёт с секцией "Что не
   покрыто".

Не переписывай отчёт целиком после черновика - только патчи через
`research-patcher`.

