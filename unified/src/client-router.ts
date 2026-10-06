import type {BonusProfile} from '../../s-kartami/src/segments/bonus-profile';
import type {CustomerContext, SegmentId} from '../../s-kartami/src/segments/segment.types';
import type {SegmentId as NoCardSegmentId} from '../../bez-kart/src/segments/segment.types';

const USER_STORAGE_KEY = 'user';

export interface ReactiveStorage {
    getItem(key: string): string | null;
    on(name: 'change', listener: StorageChangeListener): void;
    off(name: 'change', listener: StorageChangeListener): void;
}

type StorageChangeListener = (key: string | null, newValue: string | null, oldValue: string | null) => void;
type FailedRequest = 'BonusProfile' | 'GetTransactions';

interface ErrorDetails {
    failedRequest: FailedRequest;
    errorName: string;
    errorMessage: string;
    status: number | null;
}

interface ClientRouterOptions {
    storage: ReactiveStorage;
    getCachedCustomer: () => CustomerContext;
    loadBonusProfile: () => Promise<BonusProfile | null>;
    loadReservationTripCount: () => Promise<number>;
    logDisplayContext: (context: DisplayContext) => void;
    renderLoading: () => void;
    renderError: (retry: () => void) => void;
    renderNoCard: (segmentId: NoCardSegmentId) => void;
    renderCardholder: (segmentId: SegmentId, customer: CustomerContext) => void;
}

export type DisplayContext = {
    isLoggedIn: false;
    view: 'new-client';
    segmentId: 'new-client';
    bonusTripCount: null;
    reservationTripCount: null;
    cardType: null;
    customer: null;
    reason: 'not-authorized';
} | {
    isLoggedIn: true;
    view: 'new-client' | 'referral';
    segmentId: NoCardSegmentId;
    bonusTripCount: null;
    reservationTripCount: number;
    cardType: null;
    customer: null;
    reason: 'no-card';
} | {
    isLoggedIn: true;
    view: 'cardholder';
    segmentId: SegmentId;
    bonusTripCount: number | null;
    reservationTripCount: null;
    cardType: BonusProfile['cardType'];
    customer: CustomerContext;
} | {
    isLoggedIn: true;
    view: 'error';
    segmentId: null;
    bonusTripCount: null;
    reservationTripCount: null;
    cardType: null;
    customer: null;
    failedRequest: FailedRequest;
    errorName: string;
    errorMessage: string;
    status: number | null;
};

function getErrorDetails(error: unknown, failedRequest: FailedRequest): ErrorDetails {
    const status = typeof error === 'object'
        && error !== null
        && 'status' in error
        && typeof error.status === 'number'
        ? error.status
        : null;

    return {
        failedRequest,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: error instanceof Error ? error.message : String(error),
        status,
    };
}

export function isLoggedIn(storedUser: string | null): boolean {
    if (!storedUser) return false;

    try {
        const user: unknown = JSON.parse(storedUser);
        if (!user || typeof user !== 'object' || Array.isArray(user)) return false;

        const isLoggedIn = (user as {isLoggedIn?: unknown}).isLoggedIn;
        return isLoggedIn === true || isLoggedIn === 'true';
    } catch {
        return false;
    }
}

export function segmentFromBonusTripCount(bonusTripCount: number | null): SegmentId {
    if (bonusTripCount === null || bonusTripCount <= 0) return 'inactive';

    const tripCount = Math.trunc(bonusTripCount);
    if (tripCount <= 0) return 'inactive';
    if (tripCount === 1) return 'one-trip';
    if (tripCount === 2) return 'two-trips';
    return 'three-plus';
}

export function segmentFromReservationTripCount(tripCount: number): NoCardSegmentId {
    if (tripCount <= 0) return 'new-client';
    if (tripCount === 1) return 'regular-1';
    if (tripCount === 2) return 'regular-2';
    return 'regular-3';
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

    const route = async (storedUser: string | null): Promise<void> => {
        const currentRevision = ++revision;

        if (!isLoggedIn(storedUser)) {
            logDisplayContext({
                isLoggedIn: false,
                view: 'new-client',
                segmentId: 'new-client',
                bonusTripCount: null,
                reservationTripCount: null,
                cardType: null,
                customer: null,
                reason: 'not-authorized',
            });
            renderNoCard('new-client');
            return;
        }

        const cachedCustomer = getCachedCustomer();
        renderLoading();
        let bonusProfile: BonusProfile | null;
        try {
            bonusProfile = await loadBonusProfile();
        } catch (error) {
            if (currentRevision !== revision) return;
            logDisplayContext({
                isLoggedIn: true,
                view: 'error',
                segmentId: null,
                bonusTripCount: null,
                reservationTripCount: null,
                cardType: null,
                customer: null,
                ...getErrorDetails(error, 'BonusProfile'),
            });
            renderError(() => {
                void route(storage.getItem(USER_STORAGE_KEY));
            });
            return;
        }
        if (currentRevision !== revision) return;

        if (!bonusProfile || (bonusProfile.cardType === null && bonusProfile.cardNumber === null)) {
            let reservationTripCount: number;
            try {
                reservationTripCount = await loadReservationTripCount();
            } catch (error) {
                if (currentRevision !== revision) return;
                logDisplayContext({
                    isLoggedIn: true,
                    view: 'error',
                    segmentId: null,
                    bonusTripCount: null,
                    reservationTripCount: null,
                    cardType: null,
                    customer: null,
                    ...getErrorDetails(error, 'GetTransactions'),
                });
                renderError(() => {
                    void route(storage.getItem(USER_STORAGE_KEY));
                });
                return;
            }
            if (currentRevision !== revision) return;

            const segmentId = segmentFromReservationTripCount(reservationTripCount);
            logDisplayContext({
                isLoggedIn: true,
                view: segmentId === 'new-client' ? 'new-client' : 'referral',
                segmentId,
                bonusTripCount: null,
                reservationTripCount,
                cardType: null,
                customer: null,
                reason: 'no-card',
            });
            renderNoCard(segmentId);
            return;
        }

        const segmentId = segmentFromBonusTripCount(bonusProfile.bonusTripCount);
        const customer = {
            ...cachedCustomer,
            cardLevel: bonusProfile.cardType ?? cachedCustomer.cardLevel,
        };
        logDisplayContext({
            isLoggedIn: true,
            view: 'cardholder',
            segmentId,
            bonusTripCount: bonusProfile.bonusTripCount,
            reservationTripCount: null,
            cardType: bonusProfile.cardType,
            customer,
        });
        renderCardholder(segmentId, customer);
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
