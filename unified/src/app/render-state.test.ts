// @vitest-environment jsdom

import {describe, expect, it, vi} from 'vitest';
import {renderErrorState, renderLoadingState, renderUnifiedShell} from './render-state';

describe('unified view states', () => {
    it('renders one shared title and returns its content container', () => {
        const container = document.createElement('div');

        const content = renderUnifiedShell(container);

        expect(container.querySelectorAll('.unified-title')).toHaveLength(1);
        expect(container.querySelector('.unified-title')?.textContent).toBe('Клуб «Море возможностей»');
        expect(content).toBe(container.querySelector('.unified-content'));
    });

    it('renders complete card skeletons while BonusProfile is loading', () => {
        const container = document.createElement('div');

        renderLoadingState(container, {displayName: 'Имя, фамилия', cardLevel: 'Silver'});

        const cards = container.querySelectorAll('.in-da-club-member-block');
        expect(cards.length).toBeGreaterThan(0);
        expect(container.querySelectorAll('.in-da-club-member-block__skeleton--card')).toHaveLength(cards.length);
        expect(container.textContent).toBe('');
    });

    it('renders an accessible error with a working retry action', () => {
        const container = document.createElement('div');
        const retry = vi.fn();

        renderErrorState(container, retry);
        container.querySelector<HTMLButtonElement>('button')?.click();

        expect(container.querySelector('[role="alert"]')?.textContent).toContain('Не удалось загрузить данные клуба');
        expect(container.querySelectorAll('.unified-error__description br')).toHaveLength(1);
        expect(container.querySelector('.unified-error__description')?.textContent).toBe(
            'Попробуйте ещё раз. Если ошибка повторится, обновите страницу позже.',
        );
        expect(container.querySelector('button')?.textContent).toBe('Повторить');
        expect(retry).toHaveBeenCalledOnce();
    });
});
