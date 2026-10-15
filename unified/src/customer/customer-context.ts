import {normalizeCardLevel, requestBonusProfile} from './bonus-profile';
import {getStoredProfile} from './profile-storage';
import {content} from '@/content/content';
import type {CustomerContext} from '@/segmentation/member.types';

function getDisplayName(profile: ReturnType<typeof getStoredProfile>): string {
    if (!profile) return content.common.fallbackDisplayName;
    return [profile.name, profile.surname]
        .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
        .map((part) => part.trim())
        .join(' ') || content.common.fallbackDisplayName;
}

export function getCachedCustomerContext(): {
    customer: CustomerContext;
    hasDisplayName: boolean;
    shouldRequestBonusProfile: boolean;
} {
    const profile = getStoredProfile();
    const displayName = getDisplayName(profile);

    return {
        customer: {
            displayName,
            cardLevel: normalizeCardLevel(profile?.BonusLevel) ?? 'Silver',
        },
        hasDisplayName: displayName !== content.common.fallbackDisplayName,
        shouldRequestBonusProfile: Boolean(profile?.BonusUserId),
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
