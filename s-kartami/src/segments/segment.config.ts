import type {CardLevel, ContentBlockConfig, CustomerContext, SegmentConfig, SegmentId} from './segment.types';
import {typographed} from '@/shared/typography';

const CARD_IMAGE: Record<CardLevel, string> = {Silver: 'card-ag-comp.webp', Gold: 'card-au-comp.webp', Platinum: 'card-pt-comp.webp'};
const SHARED_CLIENT_MEDIA = `${__PUBLIC_ASSETS_BASE__}/media/clients/shared`;
const INACTIVE_CLIENT_MEDIA = `${__PUBLIC_ASSETS_BASE__}/media/clients/inactive`;
const CASHBACK: Record<CardLevel, number> = {Silver: 1, Gold: 2, Platinum: 3};
const BIRTHDAY_TOOLTIP = {
    title: typographed`Условия акции «Бонусы на день рождения»:`,
    content: [
        typographed`Дата начисления: за 90 дней до дня рождения`,
        typographed`Дата бронирования: до 31.12.2026`,
        typographed`Дата начала тура: нет ограничений`,
        typographed`Минимальная стоимость тура: 200 000 ₽`,
        typographed`Страны: Все, кроме РФ, СНГ, Абхазии и Грузии`,
        typographed`Срок действия бонусов: 104 дня`,
        typographed`Интервал между датой бронирования и датой начала тура: 3+ дня`,
    ],
};
const WELCOME_TOOLTIP = {
    title: typographed`Условия акции «Приветственные бонусы»:`,
    content: [
        typographed`Дата бронирования: до 31.12.2026`,
        typographed`Дата начала тура: нет ограничений`,
        typographed`Страны: Все, кроме РФ, СНГ, Абхазии и Грузии`,
        typographed`Срок действия бонусов: 90 дней`,
        typographed`Интервал между датой бронирования и датой начала тура: 3+ дня`,
        typographed`Условие списания: не больше 2% от стоимости тура`,
    ],
};

function cardBlock(level: CardLevel): ContentBlockConfig {
    return {id: 'card-level', badge: level, description: typographed`Уровень карты CoralBonus`, image: {src: `${SHARED_CLIENT_MEDIA}/${CARD_IMAGE[level]}`, alt: `Карта CoralBonus ${level}`}};
}
function birthdayBlock(): ContentBlockConfig {
    return {id: 'birthday-bonus', value: typographed`10 000`, description: typographed`Бонусов на День рождения`, tooltip: BIRTHDAY_TOOLTIP};
}
function cashbackBlock(level: CardLevel, inactive = false): ContentBlockConfig {
    return {id: 'cashback', value: `${inactive ? 3 : CASHBACK[level]}%`, valuePrefix: inactive ? typographed`до` : undefined, description: inactive ? typographed`Кешбэк бонусами за каждое бронирование` : level === 'Platinum' ? typographed`Повышенный кешбэк бонусами` : typographed`Кешбэк бонусами за каждое бронирование`};
}
const managerBlock: ContentBlockConfig = {id: 'manager', title: typographed`Персональный менеджер`, description: typographed`Всегда на связи с вами`};
const privateSalesBlock: ContentBlockConfig = {id: 'private-sales', title: typographed`Закрытые акции`, description: typographed`Досрочный доступ к предложениям`};

function inactiveBlocks(customer: CustomerContext): ContentBlockConfig[] {
    const hasDisplayName = customer.displayName !== 'Имя, фамилия';

    return [
        {
            id: 'greeting',
            title: hasDisplayName ? typographed`, скучаем по вам!` : typographed`Скучаем по вам`,
            titleAccent: hasDisplayName ? customer.displayName : undefined,
            description: typographed`Как насчёт отправиться в путешествие?`,
            action: {label: typographed`Выбрать тур`, href: '/'},
            media: {
                type: 'video',
                src: `${INACTIVE_CLIENT_MEDIA}/club.webm`,
                safariSrc: `${INACTIVE_CLIENT_MEDIA}/club.mov`,
            },
        },
        {id: 'welcome-bonus', value: typographed`5 000`, description: typographed`Приветственных бонусов`, tooltip: WELCOME_TOOLTIP},
        cardBlock(customer.cardLevel), managerBlock, cashbackBlock(customer.cardLevel, true), birthdayBlock(), privateSalesBlock,
    ];
}
function oneTripBlocks(customer: CustomerContext): ContentBlockConfig[] {
    return [
        {...birthdayBlock(), description: typographed`Бонусов<br>на День рождения`},
        {
            id: 'greeting',
            titleAccent: `${customer.displayName},`,
            title: typographed`<br>теперь вы в клубе<br>«Море возможностей»!`,
            description: customer.cardLevel === 'Platinum'
                ? typographed`Вам доступны<br>все привилегии`
                : typographed`Ваши привилегии готовы<br>к использованию`,
        },
        {id: 'club-launch', value: typographed`10 000`, description: typographed`Бонусов<br>в честь запуска клуба`},
        {...cashbackBlock(customer.cardLevel), description: typographed`Кешбэк бонусами<br>за каждое бронирование`},
        {...cardBlock(customer.cardLevel), description: typographed`Уровень карты<br>CoralBonus`},
        {
            id: 'travel-more',
            title: customer.cardLevel === 'Platinum'
                ? typographed`Путешествуйте больше`
                : typographed`Путешествуйте больше —<br>повышайте уровень карты`,
            description: '',
        },
    ];
}
function activeBlocks(customer: CustomerContext, isThreePlus: boolean): ContentBlockConfig[] {
    if (!isThreePlus) {
        const cardLevel = customer.cardLevel === 'Silver' ? 'Gold' : customer.cardLevel;

        return [
            {id: 'balance', value: typographed`3 000`, description: typographed`Бонусов на карте`},
            {
                id: 'greeting',
                title: typographed`Поздравляем,<br>`,
                titleAccent: `${customer.displayName}!`,
                titleAccentAfter: true,
                description: `Вы достигли уровня карты ${cardLevel}`,
            },
            {...cashbackBlock(cardLevel), description: typographed`Кешбэк бонусами<br>за каждое бронирование`},
            {id: 'club-launch', value: typographed`10 000`, description: typographed`Бонусов в честь<br>запуска Клуба`},
            {...cardBlock(cardLevel), description: typographed`Уровень карты<br>CoralBonus`},
            birthdayBlock(),
            {...managerBlock, title: typographed`Персональный<br>менеджер`, description: typographed`Всегда на связи<br>с вами`},
            {...privateSalesBlock, description: typographed`Досрочный доступ<br>к предложениям`},
            {
                id: 'travel-more',
                title: typographed`Больше путешествий —`,
                description: typographed`выше уровень карты. Откройте<br>расширенные привилегии клуба<br>«Море возможностей»`,
            },
        ];
    }

    const cardLevel: CardLevel = 'Platinum';

    return [
        {id: 'balance', value: typographed`3 000`, description: typographed`Доступно к списанию`},
        {
            id: 'greeting',
            titleAccent: `${customer.displayName},`,
            title: typographed`<br>вы — исключительный<br>клиент для нас!`,
            description: typographed`Вам доступны все привилегии<br>клуба «Море возможностей»`,
        },
        {...cashbackBlock(cardLevel), description: typographed`Кешбэк бонусами<br>за каждое бронирование`},
        {id: 'club-launch', value: typographed`10 000`, description: typographed`Бонусов в честь<br>запуска клуба`},
        {...cardBlock(cardLevel), description: typographed`Уровень карты<br>CoralBonus`},
        birthdayBlock(),
        {...managerBlock, title: typographed`Персональный<br>менеджер`, description: typographed`Всегда на связи<br>с вами`},
        {...privateSalesBlock, description: typographed`Досрочный доступ<br>к предложениям`},
        {id: 'travel-more', title: typographed`Индивидуальный подход`, description: typographed`Ваши бронирования —<br>в приоритете для нас`},
    ];
}

export function getSegmentConfig(id: SegmentId, customer: CustomerContext): SegmentConfig {
    const blocks = id === 'inactive' ? inactiveBlocks(customer) : id === 'one-trip' ? oneTripBlocks(customer) : activeBlocks(customer, id === 'three-plus');
    return {id, ariaLabel: id === 'inactive' ? typographed`Преимущества клуба для неактивного клиента` : typographed`Преимущества клуба для держателя карты`, blocks};
}
