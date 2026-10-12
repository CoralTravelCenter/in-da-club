// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderMemberBenefits} from './member';

describe('bootstrap', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.unstubAllGlobals();
        vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false})));
    });

    it('uses the card level override without a BonusProfile request', async () => {
        const container = document.createElement('div');

        await renderMemberBenefits({container, segmentId: 'one-trip', cardLevelOverride: 'Platinum'});

        expect(container.querySelector('.in-da-club-member-block__badge')?.textContent).toBe('Platinum');
        expect(container.textContent).toContain('Вам доступнывсе\u00a0привилегии');
    });

    it('keeps the card level override after BonusProfile is loaded', async () => {
        const container = document.createElement('div');
        window.localStorage.setItem('user', JSON.stringify({BonusUserId: 'bonus-user', BonusLevel: '1'}));
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({result: {cardType: 'Gold'}}),
        }));

        await renderMemberBenefits({container, segmentId: 'one-trip', cardLevelOverride: 'Platinum'});

        expect(container.querySelector('.in-da-club-member-block__badge')?.textContent).toBe('Platinum');
        expect(container.textContent).toContain('Вам доступнывсе\u00a0привилегии');
    });

    it('renders a provided customer context without another BonusProfile request', async () => {
        const container = document.createElement('div');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await renderMemberBenefits({
            container,
            segmentId: 'two-trips',
            customerContext: {displayName: 'Михаил', cardLevel: 'Gold'},
        });

        expect(container.querySelector('.in-da-club-member-block__badge')?.textContent).toBe('Gold');
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(['two-trips', 'three-plus'] as const)(
        'renders accumulatedBalance for the unified %s flow',
        async (segmentId) => {
            const container = document.createElement('div');

            await renderMemberBenefits({
                container,
                segmentId,
                customerContext: {displayName: 'Михаил', cardLevel: 'Platinum'},
                accumulatedBalance: 147_000,
            });

            expect(container.querySelector('[data-block-id="balance"]')?.textContent).toContain('147 000');
        },
    );

    it('renders zero when accumulatedBalance is null in the unified flow', async () => {
        const container = document.createElement('div');

        await renderMemberBenefits({
            container,
            segmentId: 'two-trips',
            customerContext: {displayName: 'Михаил', cardLevel: 'Gold'},
            accumulatedBalance: null,
        });

        expect(container.querySelector('[data-block-id="balance"]')?.textContent).toContain('0');
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

            const loading = renderMemberBenefits({container, segmentId});
            const loadingIds = [...container.querySelectorAll<HTMLElement>('.in-da-club-member-block--loading')]
                .map((block) => block.dataset.blockId)
                .sort();

            expect(loadingIds).toEqual(['card-level', 'cashback', 'greeting']);
            expect(container.querySelector('[data-block-id="greeting"] .in-da-club-member-block__skeleton--name')).not.toBeNull();
            expect(container.querySelector('[data-block-id="cashback"] .in-da-club-member-block__skeleton--value')).not.toBeNull();
            expect(container.querySelector('[data-block-id="card-level"] .in-da-club-member-block__skeleton--badge')).not.toBeNull();
            expect(container.querySelector('[data-block-id="card-level"] .in-da-club-member-block__skeleton--image')).not.toBeNull();
            expect(container.querySelector('[data-block-id="travel-more"].in-da-club-member-block--loading')).toBeNull();

            resolveFetch({ok: true, json: async () => ({result: {cardType: 'Gold'}})});
            await loading;
        },
    );
});
