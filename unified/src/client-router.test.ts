// @vitest-environment jsdom

import {describe, expect, it, vi} from 'vitest';
import type {BonusProfile} from '../../s-kartami/src/segments/bonus-profile';
import type {CustomerContext, SegmentId} from '../../s-kartami/src/segments/segment.types';
import {createClientRouter, isLoggedIn, segmentFromBonusTripCount, segmentFromReservationTripCount, type ReactiveStorage} from './client-router';

type ChangeListener = (key: string | null, newValue: string | null, oldValue: string | null) => void;

class StorageStub implements ReactiveStorage {
    private readonly listeners = new Set<ChangeListener>();

    constructor(private user: string | null) {}

    getItem(): string | null {
        return this.user;
    }

    on(_name: 'change', listener: ChangeListener): void {
        this.listeners.add(listener);
    }

    off(_name: 'change', listener: ChangeListener): void {
        this.listeners.delete(listener);
    }

    setUser(user: string | null): void {
        const previous = this.user;
        this.user = user;
        for (const listener of this.listeners) listener('user', user, previous);
    }
}

const cachedCustomer: CustomerContext = {displayName: 'Михаил', cardLevel: 'Silver'};

function bonusProfile(overrides: Partial<BonusProfile> = {}): BonusProfile {
    return {
        cardType: 'Gold',
        cardNumber: null,
        totalTravel: 0,
        bonusTripCount: 0,
        countryVisited: 0,
        balance: 0,
        accumulatedBalance: 0,
        promoBalance: 0,
        lastPeriodBonus: 0,
        bonusOperations: [],
        ...overrides,
    };
}

describe('client routing', () => {
    it.each([
        [null, false],
        ['', false],
        ['{invalid', false],
        [JSON.stringify({isLoggedIn: false}), false],
        [JSON.stringify({isLoggedIn: true}), true],
        [JSON.stringify({isLoggedIn: 'true'}), true],
    ])('detects authorization from localStorage user', (storedUser, expected) => {
        expect(isLoggedIn(storedUser)).toBe(expected);
    });

    it.each([
        [null, 'inactive'],
        [0, 'inactive'],
        [0.5, 'inactive'],
        [1, 'one-trip'],
        [2, 'two-trips'],
        [3, 'three-plus'],
        [8, 'three-plus'],
    ] as const)('maps bonusTripCount=%s to %s', (bonusTripCount, expected) => {
        expect(segmentFromBonusTripCount(bonusTripCount)).toBe(expected);
    });

    it.each([
        [0, 'new-client'],
        [1, 'regular-1'],
        [2, 'regular-2'],
        [3, 'regular-3'],
        [8, 'regular-3'],
    ] as const)('maps reservation trip count=%s to %s', (tripCount, expected) => {
        expect(segmentFromReservationTripCount(tripCount)).toBe(expected);
    });

    it('shows the new-client config without requesting BonusProfile for a guest', async () => {
        const storage = new StorageStub(JSON.stringify({isLoggedIn: false}));
        const loadBonusProfile = vi.fn<() => Promise<BonusProfile>>();
        const logDisplayContext = vi.fn();
        const renderNoCard = vi.fn();
        const renderCardholder = vi.fn();
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile,
            loadReservationTripCount: vi.fn(),
            logDisplayContext,
            renderLoading: vi.fn(),
            renderError: vi.fn(),
            renderNoCard,
            renderCardholder,
        });

        router.start();
        await vi.waitFor(() => expect(renderNoCard).toHaveBeenCalledWith('new-client'));

        expect(loadBonusProfile).not.toHaveBeenCalled();
        expect(logDisplayContext).toHaveBeenCalledWith({
            isLoggedIn: false,
            view: 'new-client',
            segmentId: 'new-client',
            bonusTripCount: null,
            reservationTripCount: null,
            cardType: null,
            customer: null,
            reason: 'not-authorized',
        });
        expect(renderCardholder).not.toHaveBeenCalled();
        router.stop();
    });

    it('reacts to login and uses bonusTripCount and cardType from BonusProfile', async () => {
        const storage = new StorageStub(null);
        const logDisplayContext = vi.fn();
        const renderCardholder = vi.fn<(segmentId: SegmentId, customer: CustomerContext) => void>();
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile: vi.fn().mockResolvedValue(bonusProfile({
                totalTravel: 8,
                bonusTripCount: 2,
                cardType: 'Platinum',
            })),
            loadReservationTripCount: vi.fn(),
            logDisplayContext,
            renderLoading: vi.fn(),
            renderError: vi.fn(),
            renderNoCard: vi.fn(),
            renderCardholder,
        });

        router.start();
        storage.setUser(JSON.stringify({isLoggedIn: true}));
        await vi.waitFor(() => expect(renderCardholder).toHaveBeenCalledOnce());

        expect(renderCardholder).toHaveBeenCalledWith('two-trips', {
            displayName: 'Михаил',
            cardLevel: 'Platinum',
        });
        expect(logDisplayContext).toHaveBeenLastCalledWith({
            isLoggedIn: true,
            view: 'cardholder',
            segmentId: 'two-trips',
            bonusTripCount: 2,
            reservationTripCount: null,
            cardType: 'Platinum',
            customer: {displayName: 'Михаил', cardLevel: 'Platinum'},
        });
        router.stop();
    });

    it('returns to new-client on logout and ignores an obsolete API response', async () => {
        const storage = new StorageStub(JSON.stringify({isLoggedIn: true}));
        let resolveProfile!: (profile: BonusProfile) => void;
        const profile = new Promise<BonusProfile>((resolve) => {
            resolveProfile = resolve;
        });
        const renderNoCard = vi.fn();
        const renderCardholder = vi.fn();
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile: () => profile,
            loadReservationTripCount: vi.fn(),
            logDisplayContext: vi.fn(),
            renderLoading: vi.fn(),
            renderError: vi.fn(),
            renderNoCard,
            renderCardholder,
        });

        router.start();
        storage.setUser(JSON.stringify({isLoggedIn: false}));
        resolveProfile(bonusProfile({bonusTripCount: 3}));
        await vi.waitFor(() => expect(renderNoCard).toHaveBeenCalledWith('new-client'));

        expect(renderCardholder).not.toHaveBeenCalled();
        router.stop();
    });

    it.each([
        ['empty result', null, 0, 'new-client', 'new-client'],
        ['one previous trip', bonusProfile({cardType: null, cardNumber: null}), 1, 'regular-1', 'referral'],
        ['two previous trips', null, 2, 'regular-2', 'referral'],
        ['three or more previous trips', null, 5, 'regular-3', 'referral'],
    ] as const)('selects the no-card segment for %s', async (_case, profile, tripCount, expectedSegment, expectedView) => {
        const storage = new StorageStub(JSON.stringify({isLoggedIn: true}));
        const logDisplayContext = vi.fn();
        const renderNoCard = vi.fn();
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile: vi.fn().mockResolvedValue(profile),
            loadReservationTripCount: vi.fn().mockResolvedValue(tripCount),
            logDisplayContext,
            renderLoading: vi.fn(),
            renderError: vi.fn(),
            renderNoCard,
            renderCardholder: vi.fn(),
        });

        router.start();
        await vi.waitFor(() => expect(renderNoCard).toHaveBeenCalledWith(expectedSegment));

        expect(logDisplayContext).toHaveBeenLastCalledWith({
            isLoggedIn: true,
            view: expectedView,
            segmentId: expectedSegment,
            bonusTripCount: null,
            reservationTripCount: tripCount,
            cardType: null,
            customer: null,
            reason: 'no-card',
        });
        router.stop();
    });

    it('shows an error and retries BonusProfile without rendering an assumed segment', async () => {
        const storage = new StorageStub(JSON.stringify({isLoggedIn: true}));
        const profile = bonusProfile({bonusTripCount: 1});
        const loadBonusProfile = vi.fn()
            .mockRejectedValueOnce(new Error('network error'))
            .mockResolvedValueOnce(profile);
        const renderLoading = vi.fn();
        const logDisplayContext = vi.fn();
        let retry!: () => void;
        const renderError = vi.fn<(callback: () => void) => void>((callback) => {
            retry = callback;
        });
        const renderCardholder = vi.fn<(segmentId: SegmentId, customer: CustomerContext) => void>();
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile,
            loadReservationTripCount: vi.fn(),
            logDisplayContext,
            renderLoading,
            renderError,
            renderNoCard: vi.fn(),
            renderCardholder,
        });

        router.start();
        await vi.waitFor(() => expect(renderError).toHaveBeenCalledOnce());
        expect(renderCardholder).not.toHaveBeenCalled();
        expect(logDisplayContext).toHaveBeenLastCalledWith({
            isLoggedIn: true,
            view: 'error',
            segmentId: null,
            bonusTripCount: null,
            reservationTripCount: null,
            cardType: null,
            customer: null,
            failedRequest: 'BonusProfile',
            errorName: 'Error',
            errorMessage: 'network error',
            status: null,
        });

        retry();
        await vi.waitFor(() => expect(renderCardholder).toHaveBeenCalledOnce());

        expect(renderLoading).toHaveBeenCalledTimes(2);
        expect(renderCardholder).toHaveBeenCalledWith('one-trip', {
            displayName: 'Михаил',
            cardLevel: 'Gold',
        });
        router.stop();
    });

    it('shows the same retryable error when GetTransactions fails', async () => {
        const storage = new StorageStub(JSON.stringify({isLoggedIn: true}));
        const renderError = vi.fn();
        const renderNoCard = vi.fn();
        const logDisplayContext = vi.fn();
        const requestError = Object.assign(new Error('GetTransactions request failed'), {status: 503});
        const router = createClientRouter({
            storage,
            getCachedCustomer: () => cachedCustomer,
            loadBonusProfile: vi.fn().mockResolvedValue(null),
            loadReservationTripCount: vi.fn().mockRejectedValue(requestError),
            logDisplayContext,
            renderLoading: vi.fn(),
            renderError,
            renderNoCard,
            renderCardholder: vi.fn(),
        });

        router.start();
        await vi.waitFor(() => expect(renderError).toHaveBeenCalledOnce());

        expect(renderNoCard).not.toHaveBeenCalled();
        expect(logDisplayContext).toHaveBeenLastCalledWith({
            isLoggedIn: true,
            view: 'error',
            segmentId: null,
            bonusTripCount: null,
            reservationTripCount: null,
            cardType: null,
            customer: null,
            failedRequest: 'GetTransactions',
            errorName: 'Error',
            errorMessage: 'GetTransactions request failed',
            status: 503,
        });
        router.stop();
    });
});
