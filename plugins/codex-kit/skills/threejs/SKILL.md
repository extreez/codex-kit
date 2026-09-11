---
name: threejs
description: >-
  Построение и отладка интерактивных 3D-сцен на Three.js: scene/camera/
  renderer, свет/материалы, загрузка GLTF, controls, производительность.
  Использовать для настоящего 3D (не canvas-имитации) — product spins,
  интерактивные hero-сцены, шейдеры, 3D-визуализация данных.
---

# Three.js

Когда брать: настоящее 3D, а не "background-эффект" — нужен полный
контроль, и есть время на пайплайн ассетов и настройку производительности.

Полный текст (ключевые API, типичные ошибки, рабочий пример) —
[threejs.md](threejs.md), дословно на английском.

## Ментальная модель

`Scene` (корневой граф) → `Camera` (Perspective/Orthographic) →
`Renderer` (`WebGLRenderer`) → `Mesh` = `Geometry` + `Material` (+ свет,
если материалы не unlit). Render loop: `requestAnimationFrame(animate)` →
обновить time-based анимации/controls/mixers → `renderer.render(scene,
camera)`.

## Ключевые вызовы

Сетап: `new THREE.WebGLRenderer({ canvas, antialias, alpha })`,
`renderer.setSize(width, height, false)`,
`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Камера на
resize: `camera.aspect = width / height; camera.updateProjectionMatrix()`.
Загрузка: `GLTFLoader`, `TextureLoader`, `DRACOLoader`. Controls:
`OrbitControls` (debug/product), `PointerLockControls` (FPS). Очистка в
SPA: `geometry.dispose()`, `material.dispose()`, `texture.dispose()`,
`renderer.dispose()`, снятие обработчиков, отмена RAF.

## Типичные ошибки

Не обработан resize → растянутый/обрезанный рендер. Слишком высокий
devicePixelRatio → перегрев мобильного GPU. Утечка WebGL-ресурсов
(нет dispose) → падения после смены роута. Тяжёлые текстуры/модели без
сжатия (Draco/KTX2) → медленный старт. Слишком много света/теней —
дорого, где можно — запечь освещение в текстуру.

При `prefers-reduced-motion: reduce` — статичный кадр без RAF или
замедленные апдейты.

## Соседние блоки

`animation-systems` (этот же блок) — принципы, нужна ли анимация вообще,
до того как строить сцену. `gsap` (этот же блок) — если сцену нужно
синхронизировать со скроллом или таймлайном.

---

*Источник: `threejs` (MengTo/Skills), MIT license. [threejs.md](threejs.md)
— дословно.*

