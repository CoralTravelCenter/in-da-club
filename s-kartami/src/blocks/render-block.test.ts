// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {BlockPresentation} from '@/segments/segment.types';
import {renderBlock} from './render-block';

const presentation: BlockPresentation = {
    placement: {
        mobile: 'list',
        desktop: {column: '1', row: '1'},
    },
};

describe('renderBlock', () => {
    beforeEach(() => vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: false})));
    afterEach(() => vi.unstubAllGlobals());

    it('renders a skeleton for the whole card without exposing its content', () => {
        const block = renderBlock({
            id: 'cashback',
            isLoading: 'card',
            value: '3%',
            description: 'Кешбэк',
            presentation,
        });

        expect(block.classList.contains('s-kartami-block--card-loading')).toBe(true);
        expect(block.getAttribute('aria-busy')).toBe('true');
        expect(block.querySelector('.s-kartami-block__skeleton--card')).not.toBeNull();
        expect(block.textContent).toBe('');
    });

    it('renders a cashback skeleton only in place of the API value', () => {
        const block = renderBlock({
            id: 'cashback',
            isLoading: true,
            value: '3%',
            description: 'Кешбэк',
            presentation,
        });

        expect(block.classList.contains('s-kartami-block--loading')).toBe(true);
        expect(block.getAttribute('aria-busy')).toBe('true');
        expect(block.querySelectorAll('.s-kartami-block__skeleton')).toHaveLength(1);
        expect(block.querySelector('.s-kartami-block__value.s-kartami-block__skeleton--value')).not.toBeNull();
        expect(block.querySelector('.s-kartami-block__quantity')).toBeNull();
        expect(block.textContent).toBe('Кешбэк');
    });

    it('keeps the card-level layout while its API data is loading', () => {
        const block = renderBlock({
            id: 'card-level',
            isLoading: true,
            badge: 'Gold',
            description: 'Уровень карты',
            image: {src: '/gold.webp', alt: 'Gold card'},
            presentation,
        });

        expect(block.dataset.cardLevel).toBe('gold');
        expect(block.querySelector('.s-kartami-block__badge.s-kartami-block__skeleton--badge')).not.toBeNull();
        expect(block.querySelector('.s-kartami-block__badge')?.children).toHaveLength(0);
        expect(block.querySelector('.s-kartami-block__skeleton--image')).not.toBeNull();
        expect(block.querySelector('img')).toBeNull();
        expect(block.textContent).toBe('Уровень карты');
    });

    it('renders the name skeleton inline with the greeting copy', () => {
        const block = renderBlock({
            id: 'greeting',
            isLoading: true,
            titleAccent: 'Имя, фамилия,',
            title: '<br>теперь вы в клубе',
            description: 'Ваши привилегии готовы',
            presentation,
        });

        expect(block.querySelector('.s-kartami-block__title .s-kartami-block__skeleton--name')).not.toBeNull();
        expect(block.textContent).toBe('теперь вы в клубеВаши привилегии готовы');
    });

    it('renders card level and image', () => {
        const block = renderBlock({id: 'card-level', badge: 'Gold', description: 'Уровень карты', image: {src: '/gold.webp', alt: 'Gold card'}, presentation});
        expect(block.dataset.cardLevel).toBe('gold');
        expect(block.querySelector('.s-kartami-block__badge')?.textContent).toBe('Gold');
        expect(block.querySelector<HTMLImageElement>('img')?.alt).toBe('Gold card');
    });

    it('renders value prefix without HTML interpolation', () => {
        const block = renderBlock({id: 'cashback', value: '3%', valuePrefix: 'до', description: 'Кешбэк', presentation});
        expect(block.querySelector('.s-kartami-block__value')?.textContent).toBe('до3%');
    });

    it('renders explicit line breaks without interpreting other HTML', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Первая строка<br>Вторая строка',
            description: 'Описание<br><strong>текст</strong>',
            presentation,
        });

        expect(block.querySelectorAll('.s-kartami-block__title br')).toHaveLength(1);
        expect(block.querySelectorAll('.s-kartami-block__description br')).toHaveLength(1);
        expect(block.querySelector('.s-kartami-block__description strong')).toBeNull();
        expect(block.querySelector('.s-kartami-block__description')?.textContent).toBe('Описание<strong>текст</strong>');
    });

    it('renders an accent inside the description', () => {
        const block = renderBlock({
            id: 'greeting',
            description: 'Вам доступны<br>',
            descriptionAccent: 'все',
            descriptionSuffix: ' привилегии',
            presentation,
        });

        expect(block.querySelector('.s-kartami-block__description-accent')?.textContent).toBe('все');
        expect(block.querySelector('.s-kartami-block__description')?.textContent).toBe('Вам доступнывсе привилегии');
    });

    it('renders strong text inside the description', () => {
        const block = renderBlock({
            id: 'greeting',
            description: 'Вы достигли уровня карты',
            descriptionStrong: 'Platinum',
            presentation,
        });

        expect(block.querySelector('.s-kartami-block__description strong')?.textContent).toBe('Platinum');
        expect(block.querySelector('.s-kartami-block__description')?.textContent).toBe('Вы достигли уровня карты Platinum');
    });

    it('renders a trailing title accent after an explicit line break', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Поздравляем,<br>',
            titleAccent: 'Анна!',
            titleAccentAfter: true,
            description: '',
            presentation,
        });
        const title = block.querySelector('.s-kartami-block__title');

        expect(title?.innerHTML).toBe('Поздравляем,<br><span class="s-kartami-block__title-accent">Анна!</span>');
    });

    it('renders an action with the Coral custom element', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Скучаем по вам',
            description: '',
            action: {label: 'Выбрать тур', href: '/'},
            presentation,
        });
        const action = block.querySelector('coral-button');
        const link = action?.querySelector<HTMLAnchorElement>('a');

        expect(action?.getAttribute('trait')).toBe('vivid');
        expect(action?.getAttribute('shape')).toBe('pill');
        expect(link?.getAttribute('href')).toBe('/');
    });

    it('opens an external-context action safely in a new tab', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Добро пожаловать',
            description: '',
            action: {label: 'Войти в личный кабинет', href: '/account/', target: '_blank'},
            presentation,
        });
        const link = block.querySelector<HTMLAnchorElement>('.s-kartami-block__action a');

        expect(link?.getAttribute('href')).toBe('/account/');
        expect(link?.target).toBe('_blank');
        expect(link?.rel).toBe('noopener');
    });

    it.each(['diamond', 'shell', 'wave', 'pearl-shell'] as const)('adds the %s modifier to the video', (variant) => {
        const block = renderBlock({
            id: 'greeting',
            description: '',
            media: {type: 'video', variant, src: `/${variant}.webm`},
            presentation,
        });

        expect(block.classList.contains('s-kartami-block--video')).toBe(true);
        expect(block.classList.contains(`s-kartami-block--video-${variant}`)).toBe(false);
        expect(block.querySelector('video')?.classList.contains(`s-kartami-block__video--${variant}`)).toBe(true);
    });

    it('renders promotion details as an accessible popover', () => {
        const block = renderBlock({
            id: 'birthday-bonus',
            value: '10 000',
            description: 'Бонусов на день рождения',
            tooltip: {title: 'Условия акции', content: ['Срок действия: 104 дня']},
            presentation,
        });
        const trigger = block.querySelector<HTMLButtonElement>('.s-kartami-tooltip-trigger');
        const tooltip = block.querySelector<HTMLElement>('.s-kartami-tooltip__content');

        expect(trigger?.getAttribute('popovertarget')).toBe('s-kartami-tooltip-birthday-bonus');
        expect(trigger?.getAttribute('aria-expanded')).toBe('false');
        expect(tooltip?.hasAttribute('popover')).toBe(true);
        expect(tooltip?.getAttribute('role')).toBe('dialog');
        expect(tooltip?.textContent).toContain('Срок действия: 104 дня');
    });
});
