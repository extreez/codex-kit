# Формула composite score — детали объединения

## Веса категорий

| Категория | Вес | Источник компонента |
|---|---|---|
| Citability | 0.25 | `citability_score` из `citability-scorer` |
| Brand authority | 0.20 | `brand_authority_score` из `brand-scanner` |
| E-E-A-T | 0.20 | `eeat_score` из `citability-scorer` |
| Technical | 0.15 | среднее `technical_crawler_score` (`geo-crawler-check`) и `technical_render_score` (`technical-schema-checker`) |
| Schema | 0.10 | `schema_score` из `technical-schema-checker` |
| Platform-specific | 0.10 | `platform_score` из `brand-scanner` |

## Формула

```
technical = (technical_crawler_score + technical_render_score) / 2

composite = 0.25 * citability_score
          + 0.20 * eeat_score
          + 0.20 * brand_authority_score
          + 0.15 * technical
          + 0.10 * schema_score
          + 0.10 * platform_score
```

Итог округляется до целого, диапазон 0-100.

## Если агент не смог оценить категорию

Не подставляй 0 молча — 0 читается как «сайт провалил категорию», а
на деле категория не проверялась (например, платформенная проверка
недоступна без выхода в сеть). В отчёте помечай такую категорию как
`не проверено`, считай composite по доступным категориям с перерасчётом
весов пропорционально (сумма весов проверенных категорий = 100%), и
явно указывай в отчёте, что итоговый score частичный.

Пример: если `platform_score` не получен, composite считается по
оставшимся 5 категориям с весами, нормированными к 1.0
(0.25/0.90, 0.20/0.90, 0.20/0.90, 0.15/0.90, 0.10/0.90), и отчёт помечает
итог как «composite по 90% покрытия категорий, platform не проверен».

## Интерпретация диапазонов (ориентир, не строгая шкала)

- 80-100 — сильная база, точечные улучшения.
- 60-79 — есть системные пробелы минимум в одной категории, стоит цикл.
- Ниже 60 — проблема минимум в двух категориях, приоритизировать по весу
  (сначала citability/brand authority/E-E-A-T — это 65% суммарного веса,
  затем technical/schema/platform).

Порог для остановки цикла (`geo-loop`) — 70/100, обоснование там же.

