// @vitest-environment jsdom

import {afterEach, describe, expect, it, vi} from 'vitest';
import type {BonusProfile} from '@/customer/bonus-profile';
import {createCardholderDisplayState, createGuestDisplayState, createProspectDisplayState} from '@/app/display-state';
import type {CardLevel} from '@/segmentation/member.types';
import {createMainBlockShowTracker, getMainBlockShowGoal} from './main-block-show';

function bonusProfile(bonusTripCount: number, cardType: CardLevel): BonusProfile {
    return {
        cardType,
        cardNumber: '1234',
        totalTravel: bonusTripCount,
        bonusTripCount,
        countryVisited: 0,
        balance: 0,
        accumulatedBalance: 0,
        promoBalance: 0,
        lastPeriodBonus: 0,
        bonusOperations: [],
    };
}

describe('main block show goals', () => {
    it.each([
        [0, 'coral_bonus_main_block_regular_0_show'],
        [1, 'coral_bonus_main_block_regular_1_show'],
        [2, 'coral_bonus_main_block_regular_2_show'],
        [3, 'coral_bonus_main_block_regular_3_show'],
    ] as const)('maps a no-card customer with %i trips', (tripCount, goal) => {
        expect(getMainBlockShowGoal(createProspectDisplayState(tripCount))).toBe(goal);
    });

    it.each([
        [0, 'Silver', 'coral_bonus_main_block_activate_the_card_show'],
        [1, 'Silver', 'coral_bonus_main_block_1_trip_silver_show'],
        [1, 'Gold', 'coral_bonus_main_block_1_trip_gold_show'],
        [1, 'Platinum', 'coral_bonus_main_block_1_trip_platinum_show'],
        [2, 'Silver', 'coral_bonus_main_block_2_trip_gold_show'],
        [2, 'Gold', 'coral_bonus_main_block_2_trip_gold_show'],
        [2, 'Platinum', 'coral_bonus_main_block_2_trip_platinum_show'],
        [3, 'Silver', 'coral_bonus_main_block_3_trip_platinum_show'],
    ] as const)('maps a cardholder with %i trips and %s level', (tripCount, cardLevel, goal) => {
        const state = createCardholderDisplayState(
            bonusProfile(tripCount, cardLevel),
            {displayName: 'Михаил', cardLevel},
        );

        expect(getMainBlockShowGoal(state)).toBe(goal);
    });

    it('does not map a guest display', () => {
        expect(getMainBlockShowGoal(createGuestDisplayState())).toBeNull();
    });
});

describe('main block show tracker', () => {
    let intersectionCallback: IntersectionObserverCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();

    class IntersectionObserverStub {
        constructor(callback: IntersectionObserverCallback) {
            intersectionCallback = callback;
        }

        observe = observe;
        disconnect = disconnect;
    }

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        observe.mockReset();
        disconnect.mockReset();
    });

    it('sends a goal only after API state and viewport intersection, once per goal', () => {
        vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
        const ym = vi.fn();
        Object.assign(window, {ym});
        const container = document.createElement('div');
        const tracker = createMainBlockShowTracker(container);
        const state = createProspectDisplayState(1);

        expect(observe).toHaveBeenCalledWith(container);
        tracker.track(state);
        expect(ym).not.toHaveBeenCalled();

        intersectionCallback([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver);
        expect(ym).toHaveBeenCalledWith(96_674_199, 'reachGoal', 'coral_bonus_main_block_regular_1_show');

        tracker.track(state);
        intersectionCallback([{isIntersecting: true} as IntersectionObserverEntry], {} as IntersectionObserver);
        expect(ym).toHaveBeenCalledOnce();

        tracker.disconnect();
        expect(disconnect).toHaveBeenCalledOnce();
    });
});
