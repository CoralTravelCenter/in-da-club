import type {BonusProfile} from '@/customer/bonus-profile';
import {SEGMENT_IDS as CARDHOLDER_SEGMENT_IDS, type CustomerContext, type SegmentId} from '@/segmentation/member.types';
import {SEGMENT_IDS as PROSPECT_SEGMENT_IDS, type SegmentId as ProspectSegmentId} from '@/segmentation/prospect.types';
import segmentRouting from '@/segmentation/routing.json';

export type FailedRequest = 'BonusProfile' | 'GetTransactions';

export type DisplayState = {
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
    segmentId: ProspectSegmentId;
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
    accumulatedBalance: number | null;
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

export type ResolvedDisplayState = Exclude<DisplayState, {view: 'error'}>;
type GuestDisplayState = Extract<DisplayState, {isLoggedIn: false}>;
type ProspectDisplayState = Extract<DisplayState, {reason: 'no-card'}>;
type CardholderDisplayState = Extract<DisplayState, {view: 'cardholder'}>;
type ErrorDisplayState = Extract<DisplayState, {view: 'error'}>;

interface SegmentRule {
    through: number | null;
    segment: string;
}

function segmentFromTripCount<SegmentId extends string>(
    tripCount: number | null,
    rules: SegmentRule[],
    segmentIds: readonly SegmentId[],
): SegmentId {
    const normalizedTripCount = Math.max(0, Math.trunc(tripCount ?? 0));
    const rule = rules.find(({through}) => through === null || normalizedTripCount <= through);

    if (!rule || !segmentIds.includes(rule.segment as SegmentId)) {
        throw new Error(`Некорректная конфигурация сегмента: ${rule?.segment ?? 'не найден'}`);
    }

    return rule.segment as SegmentId;
}

export function isLoggedIn(storedUser: string | null): boolean {
    if (!storedUser) return false;

    try {
        const user: unknown = JSON.parse(storedUser);
        if (!user || typeof user !== 'object' || Array.isArray(user)) return false;

        const value = (user as {isLoggedIn?: unknown}).isLoggedIn;
        return value === true || value === 'true';
    } catch {
        return false;
    }
}

export function segmentFromBonusTripCount(bonusTripCount: number | null): SegmentId {
    return segmentFromTripCount(bonusTripCount, segmentRouting.bonusTrips, CARDHOLDER_SEGMENT_IDS);
}

export function segmentFromReservationTripCount(tripCount: number): ProspectSegmentId {
    return segmentFromTripCount(tripCount, segmentRouting.reservationTrips, PROSPECT_SEGMENT_IDS);
}

export function hasBonusCard(profile: BonusProfile | null): profile is BonusProfile {
    return profile !== null && (profile.cardType !== null || profile.cardNumber !== null);
}

export function createGuestDisplayState(): GuestDisplayState {
    return {
        isLoggedIn: false,
        view: 'new-client',
        segmentId: 'new-client',
        bonusTripCount: null,
        reservationTripCount: null,
        cardType: null,
        customer: null,
        reason: 'not-authorized',
    };
}

export function createProspectDisplayState(reservationTripCount: number): ProspectDisplayState {
    const segmentId = segmentFromReservationTripCount(reservationTripCount);
    return {
        isLoggedIn: true,
        view: segmentId === 'new-client' ? 'new-client' : 'referral',
        segmentId,
        bonusTripCount: null,
        reservationTripCount,
        cardType: null,
        customer: null,
        reason: 'no-card',
    };
}

export function createCardholderDisplayState(
    profile: BonusProfile,
    cachedCustomer: CustomerContext,
): CardholderDisplayState {
    const customer = {
        ...cachedCustomer,
        cardLevel: profile.cardType ?? cachedCustomer.cardLevel,
    };
    return {
        isLoggedIn: true,
        view: 'cardholder',
        segmentId: segmentFromBonusTripCount(profile.bonusTripCount),
        bonusTripCount: profile.bonusTripCount,
        accumulatedBalance: profile.accumulatedBalance,
        reservationTripCount: null,
        cardType: profile.cardType,
        customer,
    };
}

export function createErrorDisplayState(error: unknown, failedRequest: FailedRequest): ErrorDisplayState {
    const status = typeof error === 'object'
        && error !== null
        && 'status' in error
        && typeof error.status === 'number'
        ? error.status
        : null;

    return {
        isLoggedIn: true,
        view: 'error',
        segmentId: null,
        bonusTripCount: null,
        reservationTripCount: null,
        cardType: null,
        customer: null,
        failedRequest,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: error instanceof Error ? error.message : String(error),
        status,
    };
}
