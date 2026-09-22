import {describe, expect, it} from 'vitest';
import {getSegmentConfig} from './segment.config';

describe('getSegmentConfig', () => {
    it('показывает имя без скобок и убирает fallback из приветствия', () => {
        const namedGreeting = getSegmentConfig('inactive', {displayName: 'Анна Иванова', cardLevel: 'Silver'}).blocks[0];
        const fallbackGreeting = getSegmentConfig('inactive', {displayName: 'Имя, фамилия', cardLevel: 'Silver'}).blocks[0];

        expect(namedGreeting).toMatchObject({
            titleAccent: 'Анна Иванова',
            title: ',<br>скучаем по\u00a0вам!',
            description: 'Как\u00a0насчёт отправиться<br>в\u00a0путешествие?',
        });
        expect(fallbackGreeting).toMatchObject({titleAccent: undefined, title: 'Скучаем по\u00a0вам'});
    });

    it('содержит полные условия приветственных бонусов и дня рождения', () => {
        const blocks = getSegmentConfig('inactive', {displayName: 'Анна', cardLevel: 'Silver'}).blocks;

        expect(blocks.find(({id}) => id === 'birthday-bonus')?.tooltip?.content).toEqual([
            'Дата начисления: за 90 дней до дня рождения',
            'Карта должна быть выпущена за 90 дней до дня рождения',
            'Дата бронирования: до 31.12.2026',
            'Дата начала тура: нет ограничений',
            'Минимальная стоимость тура: 200 000 ₽',
            'Страны: Все, кроме РФ, СНГ, Абхазии и Грузии',
            'Срок действия бонусов: 104 дня',
            'Интервал между датой бронирования и датой начала тура: 3 дня',
        ]);
        expect(blocks.find(({id}) => id === 'welcome-bonus')?.tooltip?.content).toEqual([
            'Дата активации карты: с 01.07.2026 по 31.12.2026',
            'Дата бронирования: с 01.07.2026 по 31.12.2026',
            'Дата начала тура: с 03.07.2026, без ограничений',
            'Страны: Все, кроме РФ, СНГ, Абхазии и Грузии',
            'Срок действия бонусов: 90 дней',
            'Интервал между датой бронирования и датой начала тура: 3 дня',
        ]);
    });

    it.each(['one-trip', 'two-trips', 'three-plus'] as const)('содержит условия запуска клуба для %s', (segmentId) => {
        const blocks = getSegmentConfig(segmentId, {displayName: 'Анна', cardLevel: 'Platinum'}).blocks;

        expect(blocks.find(({id}) => id === 'club-launch')?.tooltip?.content).toEqual([
            'Дата активации карты: до 31.12.2026',
            'Дата бронирования: до 31.12.2026',
            'Дата начала тура: нет ограничений',
            'Страны: Все, кроме РФ, СНГ, Абхазии и Грузии',
            'Срок действия бонусов: 180 дней',
            'Интервал между датой бронирования и датой начала тура: 3 дня',
            'Условие списания: не больше 2% от стоимости тура',
        ]);
    });

    it.each([
        ['one-trip', 'one-trip/shell'],
        ['two-trips', 'two-trips/wave'],
        ['three-plus', 'three-plus/pearl-shell'],
    ] as const)('добавляет видео в приветствие сегмента %s', (segmentId, assetPath) => {
        const greeting = getSegmentConfig(segmentId, {displayName: 'Анна', cardLevel: 'Platinum'}).blocks.find(({id}) => id === 'greeting');

        expect(greeting?.media).toMatchObject({
            type: 'video',
            src: expect.stringContaining(`/media/clients/${assetPath}.webm`),
            safariSrc: expect.stringContaining(`/media/clients/${assetPath}.mov`),
        });
    });

    it.each(['inactive', 'two-trips', 'three-plus'] as const)('добавляет кнопку закрытых акций для %s', (segmentId) => {
        const privateSales = getSegmentConfig(segmentId, {displayName: 'Анна', cardLevel: 'Platinum'}).blocks.find(({id}) => id === 'private-sales');

        expect(privateSales?.action).toEqual({
            label: 'Смотреть',
            href: '/poleznaya-informatsiya/offers/more-vozmozhnostej/',
        });
    });

    it.each([['Silver', '1%'], ['Gold', '2%'], ['Platinum', '3%']] as const)('uses cashback for %s', (cardLevel, cashback) => {
        const config = getSegmentConfig('one-trip', {displayName: 'Анна', cardLevel});
        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe(cashback);
    });

    it('adds an accent to the Platinum greeting description', () => {
        const greeting = getSegmentConfig('one-trip', {displayName: 'Анна', cardLevel: 'Platinum'}).blocks.find(({id}) => id === 'greeting');

        expect(greeting).toMatchObject({
            description: 'Вам доступны<br>',
            descriptionAccent: 'все',
            descriptionSuffix: '\u00a0привилегии',
        });
    });

    it('uses the three-plus copy for loyal clients', () => {
        const config = getSegmentConfig('three-plus', {displayName: 'Анна', cardLevel: 'Platinum'});
        expect(config.blocks.find(({id}) => id === 'greeting')).toMatchObject({
            title: expect.stringContaining('исключительный<br>клиент'),
            action: {label: 'Войти в личный кабинет', href: '/account/', target: '_blank'},
        });
        expect(config.blocks.find(({id}) => id === 'cashback')).toMatchObject({
            value: '3%',
            description: 'Повышенный кешбэк бонусами',
        });
    });

    it.each(['Silver', 'Gold', 'Platinum'] as const)('always uses Platinum for three-plus clients given %s', (cardLevel) => {
        const config = getSegmentConfig('three-plus', {displayName: 'Анна', cardLevel});

        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('3%');
        expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Platinum');
        expect(config.blocks.find(({id}) => id === 'card-level')?.image?.src).toContain('card-pt-comp.webp');
    });

    it('uses Gold as the minimum card level for clients with two trips', () => {
        const config = getSegmentConfig('two-trips', {displayName: 'Анна', cardLevel: 'Silver'});

        expect(config.blocks.find(({id}) => id === 'greeting')).toMatchObject({
            description: 'Вы\u00a0достигли уровня карты',
            descriptionStrong: 'Gold',
        });
        expect(config.blocks.find(({id}) => id === 'cashback')?.value).toBe('2%');
        expect(config.blocks.find(({id}) => id === 'card-level')?.badge).toBe('Gold');
        expect(config.blocks.find(({id}) => id === 'card-level')?.image?.src).toContain('card-au-comp.webp');
        expect(config.blocks.find(({id}) => id === 'travel-more')).toMatchObject({
            title: 'Больше путешествий —',
            description: 'выше уровень карты. Откройте<br>расширенные привилегии клуба<br>«Море возможностей»',
        });
    });

    it('uses the Platinum travel-more copy for clients with two trips', () => {
        const config = getSegmentConfig('two-trips', {displayName: 'Анна', cardLevel: 'Platinum'});

        expect(config.blocks.find(({id}) => id === 'travel-more')).toMatchObject({
            title: 'Путешествуйте чаще —',
            description: 'сохраняйте уровень карты<br>и привилегии',
        });
    });
});
