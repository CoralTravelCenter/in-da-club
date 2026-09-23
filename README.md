# in-da-club

Два независимых frontend-приложения для встроенных блоков Mindbox на `coral.ru`:

- `bez-kart` показывает преимущества CoralBonus клиентам без карты и запускает оформление карты;
- `s-kartami` показывает персонализированный контент держателям карты с учётом числа поездок и уровня Silver, Gold или Platinum.

Оба приложения используют общую инфраструктуру из `shared`: Vite/Vitest-конфигурацию, генерацию итогового HTML, ожидание DOM-контейнера, типографику и базовые SCSS-инструменты.

## Требования и установка

Требуется Node.js 22.22.2 или новее. Для nvm версия зафиксирована в `.nvmrc`.

```bash
nvm use
npm ci
```

Все команды запускаются из корня репозитория.

## Структура

```text
bez-kart/       приложение для клиентов без карты
s-kartami/      приложение для держателей карты
shared/         общий browser runtime и Sass
tests/          контрактные проверки корневой конфигурации
scripts/        служебные скрипты, включая Typograf
*.config.base.ts общие factories Vite и Vitest
graphify-out/   граф файлов, зависимостей и архитектурный отчёт
```

Подробности интеграции и локального поведения приложений находятся в `bez-kart/README.md` и `s-kartami/README.md`. Карта файлов и зависимостей находится в [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md).

## Основные команды

| Команда | Что выполняет |
| --- | --- |
| `npm run dev:bez-kart` | Типографирует `bez-kart/src` и запускает dev-сервер на порту приложения. |
| `npm run dev:s-kartami` | Типографирует `s-kartami/src` и запускает dev-сервер на порту приложения. |
| `npm run typecheck` | Проверяет оба приложения TypeScript без генерации файлов. |
| `npm test` | Последовательно запускает shared-, `bez-kart`- и `s-kartami`-тесты. |
| `npm run build` | Типографирует исходники и собирает все восемь вариантов обоих приложений. |
| `npm run build:bez-kart` | Типографирует и собирает четыре варианта `bez-kart`. |
| `npm run build:s-kartami` | Типографирует и собирает четыре варианта `s-kartami`. |
| `npm run build:bez-kart:<segment>` | Собирает один вариант `bez-kart` без отдельного запуска Typograf. |
| `npm run build:s-kartami:<segment>` | Собирает один вариант `s-kartami` без отдельного запуска Typograf. |
| `npm run typograf` | Нормализует пользовательские строки в исходниках обоих приложений. |

Команды `dev:*`, `build`, `build:bez-kart` и `build:s-kartami` запускают Typograf, который может изменить строки в исходных файлах. Для проверки без изменений последовательно выполните `npm run typecheck` и `npm test`; для сборки одного уже типографированного сегмента — соответствующую команду `build:<app>:<segment>`.

## Проверка сегментов в dev-режиме

После запуска dev-сервера добавьте к локальному URL параметр нужного сегмента. Параметры работают только в dev-режиме.

`bez-kart` использует `cb_client`:

| URL-параметр | Сегмент |
| --- | --- |
| `?cb_client=0` | `new-client` |
| `?cb_client=1` | `regular-1` |
| `?cb_client=2` | `regular-2` |
| `?cb_client=3` | `regular-3` |

`s-kartami` использует `ride`:

| URL-параметр | Сегмент |
| --- | --- |
| `?ride=0` | `inactive` |
| `?ride=1` | `one-trip` |
| `?ride=2` | `two-trips` |
| `?ride=3` | `three-plus` |

Для `s-kartami` также поддерживается прежний параметр `?cb_client=0..3`. Если переданы оба параметра, приоритет имеет `ride`.

## Сегменты и артефакты

`bez-kart`:

- `new-client` → `bez-kart/dist/new-client/bez-kart.html`;
- `regular-1` → `bez-kart/dist/regular-1/bez-kart.html`;
- `regular-2` → `bez-kart/dist/regular-2/bez-kart.html`;
- `regular-3` → `bez-kart/dist/regular-3/bez-kart.html`.

`s-kartami`:

- `inactive` → `s-kartami/dist/inactive/s-kartami.html`;
- `one-trip` → `s-kartami/dist/one-trip/s-kartami.html`;
- `two-trips` → `s-kartami/dist/two-trips/s-kartami.html`;
- `three-plus` → `s-kartami/dist/three-plus/s-kartami.html`.

Каждый файл является готовой `<script>`-обёрткой для соответствующего встроенного блока Mindbox. На целевой странице должен присутствовать контейнер:

```html
<div data-bez-kart-root></div>
```

## Правила безопасного изменения

- После изменения TypeScript выполните `npm run typecheck` и `npm test`.
- После изменения сегментов или build-конфигурации соберите затронутые варианты.
- DOM-классы, `data-block-id` и SCSS образуют единый контракт: переименовывайте их совместно и проверяйте соответствующий DOM-тест.
- Сценарий активации разделён по владельцам: popup — `card-activation.ts`, регистрация — `registration-flow.ts`, SMS и результат — `verification-flow.ts`, DOM отдельных экранов — файлы `*-view.ts`.
- Граф архитектуры обновляется командой `graphify update .`.
