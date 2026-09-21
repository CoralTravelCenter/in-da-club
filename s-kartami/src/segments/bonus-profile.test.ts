import {afterEach, describe, expect, it, vi} from 'vitest';
import {normalizeCardLevel, requestBonusProfile} from './bonus-profile';

describe('normalizeCardLevel', () => {
    it.each([
        ['Silver', 'Silver'],
        ['gold', 'Gold'],
        ['3', 'Platinum'],
        [2, 'Gold'],
        ['unknown', null],
    ] as const)('normalizes %s', (value, expected) => {
        expect(normalizeCardLevel(value)).toBe(expected);
    });
});

describe('requestBonusProfile', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('normalizes the current and legacy balance fields', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                result: {
                    cardType: 'Platinum',
                    cardNumber: '002-0009-7403',
                    totalTravel: '3',
                    balance: 1_500,
                    accumulatedBalance: '1000',
                    promoBalance: 500,
                    bonusOperations: [{id: 1}],
                },
            }),
        }));

        await expect(requestBonusProfile()).resolves.toMatchObject({
            cardType: 'Platinum',
            cardNumber: '002-0009-7403',
            totalTravel: 3,
            balance: 1_500,
            accumulatedBalance: 1_000,
            promoBalance: 500,
            bonusOperations: [{id: 1}],
        });
    });

    it('returns null for an unsuccessful response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: false}));
        await expect(requestBonusProfile()).resolves.toBeNull();
    });

    it('returns null for an invalid result', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({result: []}),
        }));
        await expect(requestBonusProfile()).resolves.toBeNull();
    });
});
