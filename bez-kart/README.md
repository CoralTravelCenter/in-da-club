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

## Строгий порядок активации карты

Этот порядок нужно сохранять в любой форме оформления CoralBonus, включая
реализации в других проектах:

```text
BonusRegister завершён
→ Mindbox Registration запущен
→ BonusSendVerificationCode завершён
→ BonusActivation завершён
→ RefreshLogin завершён
→ новый BonusUserId сохранён и повторно прочитан из localStorage
→ BonusProfile завершён
→ Mindbox Activation запущен
```

### Инварианты потока

- Все операции Customer API выполняются последовательно через `await`.
- Mindbox Registration запускается только после успешного `BonusRegister`.
  Ошибка `BonusRegister` останавливает сценарий до Mindbox и отправки SMS.
- Mindbox Registration является побочным событием и не блокирует отправку SMS:
  вызов `mindbox('async', ...)` ставит операцию в очередь, но не возвращает
  `Promise` завершения серверной обработки.
- После успешной активации карты обязательно выполняется `RefreshLogin`.
- JWT из `RefreshLogin` считается пригодным только при наличии `BonusUserId`.
- После записи профиля `BonusUserId` повторно читается из `localStorage` и
  сравнивается со значением из JWT. Одного успешного HTTP-ответа недостаточно.
- `BonusProfile` нельзя запрашивать до подтверждённого обновления профиля.
- Mindbox Activation запускается только после успешного `BonusProfile`, когда
  известны актуальные уровень и номер карты.
- Ошибки Mindbox логируются, но не меняют результат уже завершённой операции
  Customer API.

### Условия остановки

Поток прекращается и не запускает последующие операции, если:

- `BonusRegister`, отправка SMS или `BonusActivation` завершились ошибкой;
- `RefreshLogin` не вернул корректный JWT;
- в новом JWT отсутствует `BonusUserId`;
- записанный `BonusUserId` не удалось повторно прочитать из `localStorage`;
- `BonusProfile` завершился ошибкой.

В частности, при неуспешном обновлении профиля запрещены и `BonusProfile`, и
Mindbox Activation. При ошибке `BonusProfile` запрещён Mindbox Activation.

### Переносимый шаблон

```ts
await bonusRegister(registration);
sendMindboxRegistration(registration.city);

await sendVerificationCode(registration.mobilePhone);
const code = await receiveCodeFromUser();
await bonusActivation(registration.mobilePhone, code);

const refreshed = await refreshLoginAndPersistBonusProfile();
if (!refreshed) throw new Error('Не удалось обновить профиль');

const profile = readLocalProfile();
if (!profile?.BonusUserId) throw new Error('В профиле отсутствует BonusUserId');

const bonus = await getBonusProfile();
sendMindboxActivation(registration.city, bonus.cardType, bonus.cardNumber);
```

`refreshLoginAndPersistBonusProfile()` должен выполнить весь атомарный для
клиентского кода контракт: разобрать JWT, потребовать `BonusUserId`, обновить
только разрешённые `Bonus*`-поля, записать профиль и подтвердить запись повторным
чтением.

### Минимальные интеграционные проверки

1. Happy path фиксирует точный порядок всех Customer API и Mindbox-вызовов.
2. JWT без `BonusUserId` не приводит к `BonusProfile` и Mindbox Activation.
3. Ошибка `BonusProfile` не приводит к Mindbox Activation.
4. После `RefreshLogin` новый `BonusUserId` доступен при повторном чтении
   `localStorage.user`.
5. Mindbox Registration не вызывается при ошибке `BonusRegister`.

В этом проекте полный порядок проверяет
`src/card-activation/activation-sequence.test.ts`.
