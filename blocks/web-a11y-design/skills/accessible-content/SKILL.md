---
name: accessible-content
description: >-
  Контент, читаемый screen reader'ом и человеком с любым уровнем
  грамотности: alt-текст (alt-text-design.md), лейблы форм
  (form-labelling.md), структура заголовков (heading-structure.md), текст
  ссылок (link-text-design.md), доступность видео/аудио
  (multimedia-accessibility.md), читаемость текста (readable-content.md),
  таблицы (table-accessibility.md). Использовать при написании/ревью
  контента интерфейса. Требует холст Figma? Нет - применимо к любому коду
  и любому дизайн-инструменту.
---

# Accessible Content

Семь скиллов про сам контент, не про взаимодействие с ним. Открой нужный
файл по формулировке запроса.

| Запрос | Файл | Что делает |
|---|---|---|
| «напиши/провeрь alt-текст» | `alt-text-design.md` | дерево решений decorative/functional/informative/complex |
| «лейблы формы», «placeholder вместо label» | `form-labelling.md` | видимый лейбл, fieldset/legend для групп, ошибки через aria-describedby |
| «структура заголовков», «H1-H6» | `heading-structure.md` | один H1, без пропуска уровней, паттерны по типу страницы |
| «текст ссылки», «click here» | `link-text-design.md` | описательный текст, «same text → same destination» |
| «субтитры», «транскрипт», «видео» | `multimedia-accessibility.md` | точность авто-субтитров 80-85%, обязательна ручная проверка |
| «читаемость текста», «упрости копирайт» | `readable-content.md` | inverted pyramid, chunking, sentence-level правила |
| «доступная таблица» | `table-accessibility.md` | `<th scope>`, `<caption>`, максимум 5-7 колонок |

## Общее

Все семь про один принцип: то, что теряется, если убрать визуал, должно
остаться доступным другим каналом. Открой нужный файл целиком и следуй
его правилам - в конце каждого свой чеклист.

## Полный аудит интерфейса, не один вопрос

Просят проверить весь экран/продукт по доступности, не один конкретный
пункт — это работа на 4 независимых блока (`accessible-content`,
`adaptive-interfaces`, `cognitive-accessibility`, `inclusive-interaction`),
каждый смотрит на свой канал и не блокирует остальные. Раздай по subagent
на блок, тем же принципом, что зоны в `sec-audit`: спроси модель и эффорт,
дождись всех, собери находки в одну таблицу без дублей (одна и та же
проблема может всплыть в двух блоках сразу — например, alt-текст
касается и `accessible-content`, и `adaptive-interfaces`).

---

*Роутер для скиллов Owl-Listener/inclusive-design-skills
(`accessible-content`), MIT license, портировано под формат Codex.*

## Проверяемый результат (для /loop-build)

Многое здесь реально скриптуемо: alt-текст на `<img>` (DOM-проверка
пустых/отсутствующих `alt`), touch-target 44×44px (вычислимые размеры),
contrast (`check_contrast.py` из `web-taste/gate-check`), один `<h1>` без
пропуска уровней (парсинг заголовков). Готово — когда автоматический
скан по применимым правилам чист. Когнитивная нагрузка и wayfinding —
не скриптуются, там вердикт verifier-subagent.

