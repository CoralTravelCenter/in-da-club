import {describe, expect, it} from 'vitest';
import type {BonusProfile} from '@/customer/bonus-profile';
import {
    createCardholderDisplayState,
    createErrorDisplayState,
    createGuestDisplayState,
    createProspectDisplayState,
    hasBonusCard,
    isLoggedIn,
    segmentFromBonusTripCount,
    segmentFromReservationTripCount,
} from './display-state';

const profile: BonusProfile = {
    cardType: 'Platinum',
    cardNumber: '1234',
    totalTravel: 3,
    bonusTripCount: 2,
    countryVisited: 2,
    balance: 10_000,
    accumulatedBalance: 147_000,
    promoBalance: 0,
    lastPeriodBonus: 0,
    bonusOperations: [],
};

describe('display state', () => {
    it.each([
        [null, false],
        ['', false],
        ['{invalid', false],
        [JSON.stringify({isLoggedIn: false}), false],
        [JSON.stringify({isLoggedIn: true}), true],
        [JSON.stringify({isLoggedIn: 'true'}), true],
    ])('detects authorization from stored user %s', (storedUser, expected) => {
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
    ] as const)('maps bonus trip count %s to %s', (tripCount, expected) => {
        expect(segmentFromBonusTripCount(tripCount)).toBe(expected);
    });

    it.each([
        [0, 'new-client'],
        [1, 'regular-1'],
        [2, 'regular-2'],
        [3, 'regular-3'],
        [8, 'regular-3'],
    ] as const)('maps reservation trip count %s to %s', (tripCount, expected) => {
        expect(segmentFromReservationTripCount(tripCount)).toBe(expected);
    });

    it('creates the guest state', () => {
        expect(createGuestDisplayState()).toMatchObject({
            isLoggedIn: false,
            view: 'new-client',
            segmentId: 'new-client',
            reason: 'not-authorized',
        });
    });

    it('creates the prospect state from reservation history', () => {
        expect(createProspectDisplayState(2)).toMatchObject({
            isLoggedIn: true,
            view: 'referral',
            segmentId: 'regular-2',
            reservationTripCount: 2,
            reason: 'no-card',
        });
    });

    it('creates the cardholder state and applies the current card level', () => {
        expect(createCardholderDisplayState(profile, {displayName: 'Михаил', cardLevel: 'Silver'})).toMatchObject({
            view: 'cardholder',
            segmentId: 'two-trips',
            accumulatedBalance: 147_000,
            customer: {displayName: 'Михаил', cardLevel: 'Platinum'},
        });
    });

    it('distinguishes a missing card from an issued card', () => {
        expect(hasBonusCard(null)).toBe(false);
        expect(hasBonusCard({...profile, cardType: null, cardNumber: null})).toBe(false);
        expect(hasBonusCard({...profile, cardType: null})).toBe(true);
    });

    it('creates a serializable error state', () => {
        const error = Object.assign(new Error('request failed'), {status: 503});
        expect(createErrorDisplayState(error, 'BonusProfile')).toMatchObject({
            view: 'error',
            failedRequest: 'BonusProfile',
            errorName: 'Error',
            errorMessage: 'request failed',
            status: 503,
        });
    });
});
