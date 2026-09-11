---
description: Цикл контентного конвейера — продвижение по стадиям content-governance и обязательный readback после публикации
---

Запусти цикл по скиллу `content-loop`.

Критерий остановки (проверяемый): в `docs/marketing/content-pipeline.md`
ничего не зависло в DRAFT/REVIEW дольше согласованного с владельцем срока
(по умолчанию 7 дней), и у каждой строки со Stage=PUBLISHED старше 14 дней
есть непустая колонка Readback (ссылка на запись в
`docs/marketing/readback-log.md`).

Один проход:
1. Прочитать `docs/marketing/content-pipeline.md` (создать по формату
   из `content-strategy/content-governance`, если файла нет).
2. Для каждой строки — продвинуть по стадии: DRAFT готов → `copy-editing`
   → REVIEW; прошёл `expert-panel-review` (если критично) → APPROVED;
   дата публикации наступила → PUBLISHED.
3. Для строк PUBLISHED старше readback-окна без записи в
   `readback-log.md` — прогнать `metrics/analytics-readback`, записать
   решение (promote/rollback/нужно больше данных), обновить строку.
4. Повторить, пока критерий остановки не выполнен.

Спроси модель и эффорт под шаги (правило). Ничего не публикуется без
подтверждения владельца — цикл продвигает статус и напоминает про
readback, не публикует материалы самостоятельно.

