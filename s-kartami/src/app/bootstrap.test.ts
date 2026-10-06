// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {bootstrap} from './bootstrap';

describe('bootstrap', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.unstubAllGlobals();
        vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false})));
    });

    it('uses the card level override without a BonusProfile request', async () => {
        const container = document.createElement('div');

        await bootstrap({container, segmentId: 'one-trip', cardLevelOverride: 'Platinum'});

        expect(container.querySelector('.s-kartami-block__badge')?.textContent).toBe('Platinum');
        expect(container.textContent).toContain('Вам доступнывсе\u00a0привилегии');
    });

    it('keeps the card level override after BonusProfile is loaded', async () => {
        const container = document.createElement('div');
        window.localStorage.setItem('user', JSON.stringify({BonusUserId: 'bonus-user', BonusLevel: '1'}));
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({result: {cardType: 'Gold'}}),
        }));

        await bootstrap({container, segmentId: 'one-trip', cardLevelOverride: 'Platinum'});

        expect(container.querySelector('.s-kartami-block__badge')?.textContent).toBe('Platinum');
        expect(container.textContent).toContain('Вам доступнывсе\u00a0привилегии');
    });

    it('renders a provided customer context without another BonusProfile request', async () => {
        const container = document.createElement('div');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await bootstrap({
            container,
            segmentId: 'two-trips',
            customerContext: {displayName: 'Михаил', cardLevel: 'Gold'},
        });

        expect(container.querySelector('.s-kartami-block__badge')?.textContent).toBe('Gold');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(['inactive', 'one-trip', 'two-trips', 'three-plus'] as const)(
        'shows precise API skeletons for %s',
        async (segmentId) => {
            const container = document.createElement('div');
            let resolveFetch!: (response: {ok: boolean; json: () => Promise<unknown>}) => void;
            const response = new Promise<{ok: boolean; json: () => Promise<unknown>}>((resolve) => {
                resolveFetch = resolve;
            });
            window.localStorage.setItem('user', JSON.stringify({BonusUserId: 'bonus-user'}));
            vi.stubGlobal('fetch', vi.fn(() => response));

            const loading = bootstrap({container, segmentId});
            const loadingIds = [...container.querySelectorAll<HTMLElement>('.s-kartami-block--loading')]
                .map((block) => block.dataset.blockId)
                .sort();

            expect(loadingIds).toEqual(['card-level', 'cashback', 'greeting']);
            expect(container.querySelector('[data-block-id="greeting"] .s-kartami-block__skeleton--name')).not.toBeNull();
            expect(container.querySelector('[data-block-id="cashback"] .s-kartami-block__skeleton--value')).not.toBeNull();
            expect(container.querySelector('[data-block-id="card-level"] .s-kartami-block__skeleton--badge')).not.toBeNull();
            expect(container.querySelector('[data-block-id="card-level"] .s-kartami-block__skeleton--image')).not.toBeNull();
            expect(container.querySelector('[data-block-id="travel-more"].s-kartami-block--loading')).toBeNull();

            resolveFetch({ok: true, json: async () => ({result: {cardType: 'Gold'}})});
            await loading;
        },
    );
});
