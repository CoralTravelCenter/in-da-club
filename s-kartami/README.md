# bez-kart

Общее ядро собирается в четыре скрипта для четырёх встроенных блоков Mindbox.
Сегмент подставляется автоматически во время сборки, поэтому вручную менять вызов
`bootstrap` не нужно.

## Контракт с Mindbox

На целевой странице разместите пустой контейнер:

```html
<div data-bez-kart-root></div>
```

Команда `npm run build` создаёт четыре варианта:

```text
dist/new-client/bez-kart.user.js
dist/regular-1/bez-kart.user.js
dist/regular-2/bez-kart.user.js
dist/regular-3/bez-kart.user.js
```

В каждый встроенный блок Mindbox поместите файл соответствующего сегмента.
Mindbox отвечает за таргетинг, а запущенный скрипт уже содержит правильный
`segmentId` и рендерит конфигурацию в первый найденный `data-bez-kart-root`.

Отдельный вариант можно собрать, например, командой `npm run build:regular-2`.

## Типографика

Весь пользовательский текст перед вставкой в DOM обрабатывается пакетом
`typograf` с локалями `ru` и `en-US`. Используйте `typographText` из
`src/shared/typography.ts` для новых текстовых узлов и accessibility-атрибутов.
Обработка работает одинаково при `npm run dev` и `npm run build`.

## Локальные изображения

Изображения и видео храните непосредственно в папке `public`. После запуска `npm run dev`
они доступны, например, по адресу
`http://localhost:5173/cashback.png`.

Для фона используйте SCSS-миксин:

```scss
@use 'abstracts/mixins' as mixins;

.bez-kart-block--bonus {
  @include mixins.public-background('cashback.png', contain, right center);
}
```

Базовый адрес находится в `src/styles/abstracts/_config.scss`. Для production его
нужно заменить на адрес CDN или статического хоста, доступного пользователям.

## Scroll snap

Миксин `scroll-snap` настраивает контейнер и его непосредственных потомков:

```scss
@use 'abstracts/mixins' as mixins;

.bez-kart-slider {
  @include mixins.scroll-snap(
    $gap: 8px,
    $padding: 0 16px,
    $hide-scrollbar: true
  );
}
```

Для вертикальной прокрутки передайте `$direction: y`. Если snap-элементы не
являются непосредственными потомками, задайте `$item-selector`, например
`$item-selector: '.bez-kart-slide'`.
