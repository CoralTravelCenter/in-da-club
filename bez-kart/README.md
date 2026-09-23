# bez-kart

Общее ядро собирается в четыре скрипта для четырёх встроенных блоков Mindbox.
Сегмент подставляется автоматически во время сборки, поэтому вручную менять вызов
`bootstrap` не нужно.

Зависимости устанавливаются один раз в корне репозитория. Все команды ниже
запускайте из корня.

## Контракт с Mindbox

На целевой странице разместите пустой контейнер:

```html
<div data-bez-kart-root></div>
```

Команда `npm run build:bez-kart` создаёт четыре варианта:

```text
bez-kart/dist/new-client/bez-kart.html
bez-kart/dist/regular-1/bez-kart.html
bez-kart/dist/regular-2/bez-kart.html
bez-kart/dist/regular-3/bez-kart.html
```

В каждый встроенный блок Mindbox поместите файл соответствующего сегмента.
Mindbox отвечает за таргетинг, а запущенный скрипт уже содержит правильный
`segmentId` и рендерит конфигурацию в первый найденный `data-bez-kart-root`.

Отдельный вариант можно собрать, например, командой
`npm run build:bez-kart:regular-2`. Для локальной разработки используйте
`npm run dev:bez-kart`, для тестов — общую команду `npm test`.

## Типографика

Весь пользовательский текст перед вставкой в DOM обрабатывается пакетом
`typograf` с локалью `ru`. Используйте тег `typographed` из
`../shared/runtime/typography.ts` для новых текстовых узлов и accessibility-атрибутов.
Обработка работает одинаково при `npm run dev:bez-kart` и
`npm run build:bez-kart`.

## Локальные изображения

Изображения и видео храните непосредственно в папке `public`. После запуска `npm run dev:bez-kart`
они доступны, например, по адресу
`http://localhost:5173/cashback.png`.

Для фона используйте SCSS-миксин:

```scss
@use 'abstracts/mixins' as mixins;

.bez-kart-block--bonus {
  @include mixins.public-background('cashback.png', contain, right center);
}
```

Базовый адрес передаётся из `vite.config.ts` в общий Vite-конфиг. Для production
используется `productionAssetsBase`, поэтому URL ресурсов не нужно менять в SCSS.

## Scroll snap

Миксин `scroll-snap` настраивает контейнер и его непосредственных потомков:

```scss
@use 'abstracts/mixins' as mixins;

.bez-kart-slider {
  @include mixins.scroll-snap(
    $gap: 8px,
    $hide-scrollbar: true
  );
}
```

Внутренние отступы и `scroll-padding` задавайте на самом контейнере: миксин отвечает
только за механику прокрутки и snap-поведение.

Для вертикальной прокрутки передайте `$direction: y`. Если snap-элементы не
являются непосредственными потомками, задайте `$item-selector`, например
`$item-selector: '.bez-kart-slide'`.
