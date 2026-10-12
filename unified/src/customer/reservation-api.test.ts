// @vitest-environment jsdom

import {afterEach, describe, expect, it, vi} from 'vitest';
import {requestReservationTripCount} from './reservation-api';

describe('requestReservationTripCount', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('requests the first transactions page and returns myTrips.count', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                result: {customerStats: {myTrips: {count: 2}}},
            }),
        }));

        await expect(requestReservationTripCount()).resolves.toBe(2);
        expect(fetch).toHaveBeenCalledWith('/endpoints/Reservation/GetTransactions', expect.objectContaining({
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                requestType: 1,
                paging: {pageNumber: 1, pageSize: 3},
            }),
        }));
    });

    it('normalizes a numeric count returned as a string', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                result: {customerStats: {myTrips: {count: '3'}}},
            }),
        }));

        await expect(requestReservationTripCount()).resolves.toBe(3);
    });

    it('rejects an unsuccessful response', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: false, status: 503}));
        await expect(requestReservationTripCount()).rejects.toMatchObject({
            message: 'GetTransactions request failed',
            status: 503,
        });
    });

    it('rejects a response without myTrips.count', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({result: {customerStats: {myTrips: {}}}}),
        }));

        await expect(requestReservationTripCount()).rejects.toThrow('GetTransactions trip count is invalid');
    });
});
