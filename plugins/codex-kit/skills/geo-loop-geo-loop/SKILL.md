---
name: geo-loop-geo-loop
description: "Codex skill generated from block command geo-loop."
---

---
description: Цикл GEO — composite score до порога 70/100
---

Запусти цикл по скиллу `geo-loop`.

Критерий остановки (проверяемый): composite score из последнего
`docs/seo/geo-*.md` ≥ 70/100.

Один проход: `/geo-optimize` → фикс находок, приоритет по весу категории
(citability/E-E-A-T/brand authority — 65% суммарного веса, чинить первыми)
→ снова `/geo-optimize`. Порог достигнут — стоп.

Спроси модель и эффорт под шаги. Фикс не переписывает контент без
подтверждения.

