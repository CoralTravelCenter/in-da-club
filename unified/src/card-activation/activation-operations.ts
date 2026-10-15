import {
    activateCard,
    refreshUser,
    registerCard,
} from './api/customer-api';
import {sendBonusAccountActivation, sendBonusAccountRegistration} from './api/mindbox';
import type {RegistrationData} from './model/registration';
import {content} from '@/content/content';
import {requestBonusProfileStrict, type BonusProfile} from '@/customer/bonus-profile';
import {getStoredProfile, type UserProfile} from '@/customer/profile-storage';

type IssuedBonusProfile = BonusProfile & {
    cardType: NonNullable<BonusProfile['cardType']>;
    cardNumber: string;
};
const ACTIVATION_BONUS_PROFILE_TIMEOUT_MS = 10_000;

export async function registerBonusAccount(data: RegistrationData, clientId: unknown): Promise<void> {
    await registerCard(data);
    sendBonusAccountRegistration(data.city, clientId);
}

export async function activateBonusAccount(
    mobilePhone: string,
    activationCode: string,
): Promise<void> {
    await activateCard(mobilePhone, activationCode);
}

export async function loadActivatedAccount(
    data: RegistrationData,
    clientId: unknown,
): Promise<{bonus: BonusProfile; profile: UserProfile}> {
    if (!await refreshUser()) {
        throw new Error(content.activation.errors.refreshCard);
    }

    const bonus = await loadIssuedBonusProfile();
    const profile = getStoredProfile();
    if (!profile) throw new Error(content.activation.errors.refreshCard);

    sendBonusAccountActivation(data.city, bonus.cardType, bonus.cardNumber, clientId);
    return {bonus, profile};
}

export async function loadIssuedBonusProfile(): Promise<IssuedBonusProfile> {
    const bonus = await requestBonusProfileStrict(undefined, ACTIVATION_BONUS_PROFILE_TIMEOUT_MS);
    if (!bonus?.cardType || !bonus.cardNumber?.trim()) {
        throw new Error(content.activation.errors.loadCard);
    }
    return {
        ...bonus,
        cardType: bonus.cardType,
        cardNumber: bonus.cardNumber,
    };
}
