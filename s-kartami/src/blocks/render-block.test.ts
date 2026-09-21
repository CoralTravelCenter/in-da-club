// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import {renderBlock} from './render-block';

describe('renderBlock', () => {
    it('renders a skeleton instead of API-dependent content while loading', () => {
        const block = renderBlock({
            id: 'cashback',
            isLoading: true,
            value: '3%',
            description: 'Кешбэк',
        });

        expect(block.classList.contains('s-kartami-block--loading')).toBe(true);
        expect(block.getAttribute('aria-busy')).toBe('true');
        expect(block.querySelectorAll('.s-kartami-block__skeleton')).toHaveLength(2);
        expect(block.textContent).toBe('');
    });

    it('renders card level and image', () => {
        const block = renderBlock({id: 'card-level', badge: 'Gold', description: 'Уровень карты', image: {src: '/gold.webp', alt: 'Gold card'}});
        expect(block.dataset.cardLevel).toBe('gold');
        expect(block.querySelector('.s-kartami-block__badge')?.textContent).toBe('Gold');
        expect(block.querySelector<HTMLImageElement>('img')?.alt).toBe('Gold card');
    });

    it('renders value prefix without HTML interpolation', () => {
        const block = renderBlock({id: 'cashback', value: '3%', valuePrefix: 'до', description: 'Кешбэк'});
        expect(block.querySelector('.s-kartami-block__value')?.textContent).toBe('до3%');
    });

    it('renders explicit line breaks without interpreting other HTML', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Первая строка<br>Вторая строка',
            description: 'Описание<br><strong>текст</strong>',
        });

        expect(block.querySelectorAll('.s-kartami-block__title br')).toHaveLength(1);
        expect(block.querySelectorAll('.s-kartami-block__description br')).toHaveLength(1);
        expect(block.querySelector('.s-kartami-block__description strong')).toBeNull();
        expect(block.querySelector('.s-kartami-block__description')?.textContent).toBe('Описание<strong>текст</strong>');
    });

    it('renders a trailing title accent after an explicit line break', () => {
        const block = renderBlock({
            id: 'greeting',
            title: 'Поздравляем,<br>',
            titleAccent: 'Анна!',
            titleAccentAfter: true,
            description: '',
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
        });
        const action = block.querySelector('coral-button');
        const link = action?.querySelector<HTMLAnchorElement>('a');

        expect(action?.getAttribute('trait')).toBe('vivid');
        expect(action?.getAttribute('shape')).toBe('pill');
        expect(link?.getAttribute('href')).toBe('/');
    });

    it('renders promotion details as an accessible popover', () => {
        const block = renderBlock({
            id: 'birthday-bonus',
            value: '10 000',
            description: 'Бонусов на день рождения',
            tooltip: {title: 'Условия акции', content: ['Срок действия: 104 дня']},
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
