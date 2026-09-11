---
name: marketing-audit-marketing-audit
description: "Codex skill generated from block command marketing-audit."
---

---
description: Кросс-канальный аудит маркетинга — фундамент/контент/каналы/реклама-CRO параллельно, взвешенный отчёт
---

Запусти оценку по скиллу `marketing-audit`.

Обязательно:
1. Сначала спроси модель и эффорт под 4 субагентов (правило).
2. Запусти `positioning-checker`, `content-checker`, `channel-checker`,
   `paid-cro-checker` параллельно, каждый недоверчиво по своей зоне.
3. Объедини в composite score по формуле `references/health-rubric.md`.
4. Отчёт с разбивкой по зонам, находками, разделом «не проверено» и
   топ-3 рекомендациями (не всё сразу — самое дешёвое/дорогое по
   влиянию).

Не чини находки в этом проходе. Только оценка и отчёт — фиксом
конкретной зоны занимается её блок (`content-loop`, `paid-ads-loop`,
`cro-funnel-loop` или ручная правка).

