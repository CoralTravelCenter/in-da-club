import type {CardLevel} from './segment.types';

export interface BonusProfile {
    cardType: CardLevel | null;
    cardNumber: string | null;
    totalTravel: number | null;
    countryVisited: number | null;
    balance: number | null;
    accumulatedBalance: number | null;
    promoBalance: number | null;
    lastPeriodBonus: number | null;
    bonusOperations: unknown[];
}

const BONUS_PROFILE_URL = '/endpoints/Customer/BonusProfile';
const BONUS_PROFILE_TIMEOUT_MS = 5_000;

function asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }
    return null;
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

export function normalizeCardLevel(value: unknown): CardLevel | null {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'silver' || normalized === '1') return 'Silver';
    if (normalized === 'gold' || normalized === '2') return 'Gold';
    if (normalized === 'platinum' || normalized === '3') return 'Platinum';
    return null;
}

function normalizeBonusProfile(value: unknown): BonusProfile | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

    const source = value as Record<string, unknown>;
    return {
        cardType: normalizeCardLevel(source.cardType),
        cardNumber: asString(source.cardNumber),
        totalTravel: asNumber(source.totalTravel),
        countryVisited: asNumber(source.countryVisited),
        balance: asNumber(source.balance),
        accumulatedBalance: asNumber(source.accumulatedBalance),
        promoBalance: asNumber(source.promoBalance),
        lastPeriodBonus: asNumber(source.lastPeriodBonus),
        bonusOperations: Array.isArray(source.bonusOperations) ? source.bonusOperations : [],
    };
}

export async function requestBonusProfile(signal?: AbortSignal): Promise<BonusProfile | null> {
    const timeoutSignal = AbortSignal.timeout(BONUS_PROFILE_TIMEOUT_MS);
    const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

    try {
        const response = await fetch(BONUS_PROFILE_URL, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: '{}',
            signal: requestSignal,
        });

        if (!response.ok) return null;

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

        return normalizeBonusProfile((payload as {result?: unknown}).result);
    } catch {
        return null;
    }
}
