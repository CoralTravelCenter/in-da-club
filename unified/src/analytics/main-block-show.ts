import type {ResolvedDisplayState} from '@/app/display-state';

const COUNTER_ID = 96_674_199;

type Goal =
    | 'coral_bonus_main_block_regular_0_show'
    | 'coral_bonus_main_block_regular_1_show'
    | 'coral_bonus_main_block_regular_2_show'
    | 'coral_bonus_main_block_regular_3_show'
    | 'coral_bonus_main_block_activate_the_card_show'
    | 'coral_bonus_main_block_1_trip_silver_show'
    | 'coral_bonus_main_block_1_trip_gold_show'
    | 'coral_bonus_main_block_1_trip_platinum_show'
    | 'coral_bonus_main_block_2_trip_gold_show'
    | 'coral_bonus_main_block_2_trip_platinum_show'
    | 'coral_bonus_main_block_3_trip_platinum_show';

type YandexMetrika = (counterId: number, method: 'reachGoal', goal: Goal) => void;

export function getMainBlockShowGoal(state: ResolvedDisplayState): Goal | null {
    if (!state.isLoggedIn) return null;

    if (state.view !== 'cardholder') {
        const goals = {
            'new-client': 'coral_bonus_main_block_regular_0_show',
            'regular-1': 'coral_bonus_main_block_regular_1_show',
            'regular-2': 'coral_bonus_main_block_regular_2_show',
            'regular-3': 'coral_bonus_main_block_regular_3_show',
        } as const;
        return goals[state.segmentId];
    }

    if (state.segmentId === 'inactive') {
        return 'coral_bonus_main_block_activate_the_card_show';
    }
    if (state.segmentId === 'three-plus') {
        return 'coral_bonus_main_block_3_trip_platinum_show';
    }

    const tripCount = state.segmentId === 'one-trip' ? 1 : 2;
    const cardLevel = tripCount === 2 && state.customer.cardLevel === 'Silver'
        ? 'gold'
        : state.customer.cardLevel.toLowerCase();

    return `coral_bonus_main_block_${tripCount}_trip_${cardLevel}_show` as Goal;
}

export function createMainBlockShowTracker(container: HTMLElement): {
    track: (state: ResolvedDisplayState) => void;
    disconnect: () => void;
} {
    const sentGoals = new Set<Goal>();
    let currentGoal: Goal | null = null;
    let isVisible = false;

    const sendIfReady = (): void => {
        if (!isVisible || !currentGoal || sentGoals.has(currentGoal)) return;

        const metrika = (window as Window & {ym?: YandexMetrika}).ym;
        if (typeof metrika !== 'function') return;

        metrika(COUNTER_ID, 'reachGoal', currentGoal);
        sentGoals.add(currentGoal);
    };

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
        sendIfReady();
    });
    observer.observe(container);

    return {
        track: (state) => {
            currentGoal = getMainBlockShowGoal(state);
            sendIfReady();
        },
        disconnect: () => observer.disconnect(),
    };
}
