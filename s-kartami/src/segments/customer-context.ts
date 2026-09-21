import {normalizeCardLevel, requestBonusProfile} from './bonus-profile';
import type {CustomerContext} from './segment.types';

interface StoredProfile {
    name?: unknown;
    surname?: unknown;
    BonusLevel?: unknown;
    BonusUserId?: unknown;
}

function readStoredProfile(): StoredProfile {
    try {
        const stored = window.localStorage.getItem('user');
        const parsed: unknown = stored ? JSON.parse(stored) : null;

        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as StoredProfile
            : {};
    } catch {
        return {};
    }
}

function getDisplayName(profile: StoredProfile): string {
    return [profile.name, profile.surname]
        .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
        .map((part) => part.trim())
        .join(' ') || 'Имя, фамилия';
}

export function getCachedCustomerContext(): {
    customer: CustomerContext;
    hasDisplayName: boolean;
    shouldRequestBonusProfile: boolean;
} {
    const profile = readStoredProfile();
    const displayName = getDisplayName(profile);

    return {
        customer: {
            displayName,
            cardLevel: normalizeCardLevel(profile.BonusLevel) ?? 'Silver',
        },
        hasDisplayName: displayName !== 'Имя, фамилия',
        shouldRequestBonusProfile: Boolean(profile.BonusUserId),
    };
}

export async function getCustomerContext(signal?: AbortSignal): Promise<CustomerContext> {
    const cached = getCachedCustomerContext();
    const bonusProfile = cached.shouldRequestBonusProfile
        ? await requestBonusProfile(signal)
        : null;

    return {
        ...cached.customer,
        cardLevel: bonusProfile?.cardType ?? cached.customer.cardLevel,
    };
}
