// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getCachedCustomerContext, getCustomerContext} from './customer-context';

describe('getCustomerContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('uses cardType returned by BonusProfile', async () => {
        window.localStorage.setItem('user', JSON.stringify({
            name: 'Анна',
            surname: 'Иванова',
            BonusUserId: 'bonus-user',
            BonusLevel: '1',
        }));
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({result: {cardType: 'Gold'}}),
        }));

        await expect(getCustomerContext()).resolves.toEqual({
            displayName: 'Анна Иванова',
            cardLevel: 'Gold',
        });
        expect(fetch).toHaveBeenCalledWith('/endpoints/Customer/BonusProfile', expect.objectContaining({
            method: 'POST',
            body: '{}',
        }));
    });

    it('falls back to BonusLevel when the request fails', async () => {
        window.localStorage.setItem('user', JSON.stringify({
            BonusUserId: 'bonus-user',
            BonusLevel: '3',
        }));
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

        await expect(getCustomerContext()).resolves.toEqual({
            displayName: 'Имя, фамилия',
            cardLevel: 'Platinum',
        });
    });

    it('does not request BonusProfile without BonusUserId', async () => {
        window.localStorage.setItem('user', JSON.stringify({BonusLevel: '2'}));
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        await expect(getCustomerContext()).resolves.toEqual({
            displayName: 'Имя, фамилия',
            cardLevel: 'Gold',
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns cached context synchronously before BonusProfile is loaded', () => {
        window.localStorage.setItem('user', JSON.stringify({
            name: 'Анна',
            surname: 'Иванова',
            BonusUserId: 'bonus-user',
            BonusLevel: '2',
        }));

        expect(getCachedCustomerContext()).toEqual({
            customer: {displayName: 'Анна Иванова', cardLevel: 'Gold'},
            hasDisplayName: true,
            shouldRequestBonusProfile: true,
        });
    });

    it('marks a missing cached name', () => {
        window.localStorage.setItem('user', JSON.stringify({BonusUserId: 'bonus-user'}));

        expect(getCachedCustomerContext().hasDisplayName).toBe(false);
    });
});
