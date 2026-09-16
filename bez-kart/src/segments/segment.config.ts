import type {ContentBlockConfig, SegmentConfig, SegmentContentConfig, SegmentId,} from './segment.types';

const CLUB_VIDEO_URL = 'http://localhost:5173/club.mp4';

export const SEGMENT_CONTENT = {
    'new-client': {
        ariaLabel: 'Преимущества нового клиента',
        bonus: {
            title: '5 000',
            description: 'Приветственных бонусов',
        },
        club: {
            level: 'Silver',
            action: {
                label: 'Активировать карту',
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 1,
            description: 'Кешбэк бонусами<br> за каждое бронирование',
        },
    },
    'regular-1': {
        ariaLabel: 'Преимущества постоянного клиента, уровень 1',
        bonus: {
            title: '10 000',
            description: 'Приветственные бонусы для новых держателей карты',
        },
        club: {
            level: 'Silver',
            action: {
                label: 'Активировать карту',
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 1,
            description: 'Кешбэк бонусами за каждое бронирование',
        },
    },
    'regular-2': {
        ariaLabel: 'Преимущества постоянного клиента, уровень 2',
        bonus: {
            title: '10 000',
            description: 'Приветственные бонусы для новых держателей карты',
        },
        club: {
            level: 'Silver',
            action: {
                label: 'Активировать карту',
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 2,
            description: 'Кешбэк бонусами за каждое бронирование',
        },
    },
    'regular-3': {
        ariaLabel: 'Преимущества постоянного клиента, уровень 3',
        bonus: {
            title: '10 000',
            description: 'Приветственные бонусы для новых держателей карты',
        },
        club: {
            level: 'Silver',
            action: {
                label: 'Активировать карту',
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 3,
            description: 'Кешбэк бонусами за каждое бронирование',
        },
    },
} satisfies Record<SegmentId, SegmentContentConfig>;

export function getSegmentConfig(id: SegmentId): SegmentConfig {
    const content = SEGMENT_CONTENT[id];
    const cashbackValue = `${content.cashback.percent}%`;
    const blocks: ContentBlockConfig[] = [
        {
            id: 'club',
            title: 'Вступайте в клуб «Море возможностей» – получайте больше привилегий на отдых',
            description: '',
            action: content.club.action,
            media: content.club.media,
        },
        {
            id: 'cashback',
            value: cashbackValue,
            valuePrefix: 'до',
            description: content.cashback.description,
        },
        {
            id: 'birthday-bonus',
            value: '10 000',
            description: 'Бонусов<br> на День рождения',
            tooltip: {
                title: 'Условия акции «Бонусы на день рождения»:',
                content: [
                    'Дата начисления: за 90 дней до дня рождения',
                    'Дата бронирования: до 31.12.2026',
                    'Дата начала тура: нет ограничений',
                    'Минимальная стоимость тура: 200 000 ₽',
                    'Страны: Все, кроме РФ, СНГ, Абхазии и Грузии',
                    'Срок действия бонусов: 104 дня',
                    'Интервал между датой бронирования и датой начала тура: 3 дня',
                ],
            },
        },
        {
            id: 'welcome-bonus',
            value: content.bonus.title,
            description: content.bonus.description,
            tooltip: {
                title: 'Условия акции «Приветственные бонусы»:',
                content: [
                    'Дата бронирования: до 31.12.2026',
                    'Дата начала тура: нет ограничений',
                    'Страны: Все, кроме РФ, СНГ, Абхазии и Грузии',
                    'Срок действия бонусов: 180 дней',
                    'Интервал между датой бронирования и датой начала тура: 3 дня',
                    'Условие списания: не больше 2% от стоимости тура',
                ],
            },
        },
        {
            id: 'private-sales',
            title: 'Закрытые акции',
            description: 'Досрочный доступ<br> к предложениям',
        },
        {
            id: 'manager',
            title: 'Персональный менеджер',
            description: 'Всегда на связи с вами',
        },
    ];

    return {
        id,
        ariaLabel: content.ariaLabel,
        blocks,
    };
}
