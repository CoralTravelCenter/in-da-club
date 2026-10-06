// @vitest-environment jsdom

import {describe, expect, it, vi} from 'vitest';
import {renderErrorState, renderLoadingState} from './render-state';

describe('unified view states', () => {
    it('renders complete card skeletons while BonusProfile is loading', () => {
        const container = document.createElement('div');

        renderLoadingState(container, {displayName: 'Имя, фамилия', cardLevel: 'Silver'});

        const cards = container.querySelectorAll('.s-kartami-block');
        expect(cards.length).toBeGreaterThan(0);
        expect(container.querySelectorAll('.s-kartami-block__skeleton--card')).toHaveLength(cards.length);
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
