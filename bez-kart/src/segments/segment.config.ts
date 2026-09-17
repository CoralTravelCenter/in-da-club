import type {ContentBlockConfig, SegmentConfig, SegmentContentConfig, SegmentId,} from './segment.types';
import {typographed} from '../shared/typography';

const CLUB_VIDEO_URL = 'http://localhost:5173/club.mp4';

export const SEGMENT_CONTENT = {
    'new-client': {
        ariaLabel: typographed`Преимущества нового клиента`,
        bonus: {
            title: typographed`5 000`,
            description: typographed`Приветственных бонусов`,
        },
        club: {
            level: 'Silver',
            action: {
                label: typographed`Активировать карту`,
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 3,
            description: typographed`Кешбэк бонусами<br> за каждое бронирование`,
        },
    },
    'regular-1': {
        ariaLabel: typographed`Преимущества постоянного клиента, уровень 1`,
        bonus: {
            title: typographed`10 000`,
            description: typographed`Приветственные бонусы для новых держателей карты`,
        },
        club: {
            level: 'Silver',
            action: {
                label: typographed`Активировать карту`,
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 3,
            description: typographed`Кешбэк бонусами за каждое бронирование`,
        },
    },
    'regular-2': {
        ariaLabel: typographed`Преимущества постоянного клиента, уровень 2`,
        bonus: {
            title: typographed`10 000`,
            description: typographed`Приветственные бонусы для новых держателей карты`,
        },
        club: {
            level: 'Silver',
            action: {
                label: typographed`Активировать карту`,
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 3,
            description: typographed`Кешбэк бонусами за каждое бронирование`,
        },
    },
    'regular-3': {
        ariaLabel: typographed`Преимущества постоянного клиента, уровень 3`,
        bonus: {
            title: typographed`10 000`,
            description: typographed`Приветственные бонусы для новых держателей карты`,
        },
        club: {
            level: 'Silver',
            action: {
                label: typographed`Активировать карту`,
                type: 'activate-card',
            },
            media: {
                type: 'video',
                src: CLUB_VIDEO_URL,
            },
        },
        cashback: {
            percent: 3,
            description: typographed`Кешбэк бонусами за каждое бронирование`,
        },
    },
} satisfies Record<SegmentId, SegmentContentConfig>;

export function getSegmentConfig(id: SegmentId): SegmentConfig {
    const content = SEGMENT_CONTENT[id];
    const cashbackValue = `${content.cashback.percent}%`;
    const blocks: ContentBlockConfig[] = [
        {
            id: 'club',
            title: typographed`Вступайте в клуб «Море возможностей» — получайте больше привилегий на отдых`,
            description: '',
            action: content.club.action,
            media: content.club.media,
        },
        {
            id: 'cashback',
            value: cashbackValue,
            valuePrefix: typographed`до`,
            description: content.cashback.description,
        },
        {
            id: 'birthday-bonus',
            value: typographed`10 000`,
            description: typographed`Бонусов<br> на День рождения`,
            tooltip: {
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
            },
        },
        {
            id: 'welcome-bonus',
            value: content.bonus.title,
            description: content.bonus.description,
            tooltip: {
                title: typographed`Условия акции «Приветственные бонусы»:`,
                content: [
                    typographed`Дата бронирования: до 31.12.2026`,
                    typographed`Дата начала тура: нет ограничений`,
                    typographed`Страны: Все, кроме РФ, СНГ, Абхазии и Грузии`,
                    typographed`Срок действия бонусов: 90 дней`,
                    typographed`Интервал между датой бронирования и датой начала тура: 3+ дня`,
                    typographed`Условие списания: не больше 2% от стоимости тура`,
                ],
            },
        },
        {
            id: 'private-sales',
            title: typographed`Закрытые акции`,
            description: typographed`Досрочный доступ<br> к предложениям`,
        },
        {
            id: 'manager',
            title: typographed`Персональный менеджер`,
            description: typographed`Всегда на связи с вами`,
        },
    ];

    return {
        id,
        ariaLabel: content.ariaLabel,
        blocks,
    };
}
