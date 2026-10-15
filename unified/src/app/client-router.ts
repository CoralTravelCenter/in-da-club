import type {BonusProfile} from '@/customer/bonus-profile';
import type {CustomerContext, SegmentId} from '@/segmentation/member.types';
import type {SegmentId as NoCardSegmentId} from '@/segmentation/prospect.types';
import {
    createCardholderDisplayState,
    createErrorDisplayState,
    createGuestDisplayState,
    createProspectDisplayState,
    hasBonusCard,
    isLoggedIn,
    type DisplayState,
    type FailedRequest,
    type ResolvedDisplayState,
} from './display-state';

const USER_STORAGE_KEY = 'user';

export interface ReactiveStorage {
    getItem(key: string): string | null;
    on(name: 'change', listener: StorageChangeListener): void;
    off(name: 'change', listener: StorageChangeListener): void;
}

type StorageChangeListener = (key: string | null, newValue: string | null, oldValue: string | null) => void;
interface ClientRouterOptions {
    storage: ReactiveStorage;
    getCachedCustomer: () => CustomerContext;
    loadBonusProfile: () => Promise<BonusProfile | null>;
    loadReservationTripCount: () => Promise<number>;
    logDisplayContext: (context: DisplayState) => void;
    renderLoading: () => void;
    renderError: (retry: () => void) => void;
    renderNoCard: (segmentId: NoCardSegmentId) => void;
    renderCardholder: (segmentId: SegmentId, customer: CustomerContext, accumulatedBalance: number | null) => void;
}

export function createClientRouter({
    storage,
    getCachedCustomer,
    loadBonusProfile,
    loadReservationTripCount,
    logDisplayContext,
    renderLoading,
    renderError,
    renderNoCard,
    renderCardholder,
}: ClientRouterOptions): {start: () => void; stop: () => void} {
    let revision = 0;

    const display = (state: ResolvedDisplayState): void => {
        logDisplayContext(state);
        if (state.view === 'cardholder') {
            renderCardholder(state.segmentId, state.customer, state.accumulatedBalance);
            return;
        }
        renderNoCard(state.segmentId);
    };

    const displayError = (error: unknown, failedRequest: FailedRequest): void => {
        logDisplayContext(createErrorDisplayState(error, failedRequest));
        renderError(() => {
            void route(storage.getItem(USER_STORAGE_KEY));
        });
    };

    const route = async (storedUser: string | null): Promise<void> => {
        const currentRevision = ++revision;

        if (!isLoggedIn(storedUser)) {
            display(createGuestDisplayState());
            return;
        }

        const cachedCustomer = getCachedCustomer();
        renderLoading();
        let bonusProfile: BonusProfile | null;
        try {
            bonusProfile = await loadBonusProfile();
        } catch (error) {
            if (currentRevision !== revision) return;
            displayError(error, 'BonusProfile');
            return;
        }
        if (currentRevision !== revision) return;

        if (!hasBonusCard(bonusProfile)) {
            let reservationTripCount: number;
            try {
                reservationTripCount = await loadReservationTripCount();
            } catch (error) {
                if (currentRevision !== revision) return;
                displayError(error, 'GetTransactions');
                return;
            }
            if (currentRevision !== revision) return;

            display(createProspectDisplayState(reservationTripCount));
            return;
        }

        display(createCardholderDisplayState(bonusProfile, cachedCustomer));
    };

    const handleStorageChange: StorageChangeListener = (key, newValue) => {
        if (key !== null && key !== USER_STORAGE_KEY) return;
        void route(key === USER_STORAGE_KEY ? newValue : null);
    };

    return {
        start: () => {
            storage.on('change', handleStorageChange);
            void route(storage.getItem(USER_STORAGE_KEY));
        },
        stop: () => {
            revision += 1;
            storage.off('change', handleStorageChange);
        },
    };
}
