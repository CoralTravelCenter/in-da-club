import {getProfile, type UserProfile} from './profile';
import {typographed} from '@/shared/typography';

export interface RegistrationData {
    givenName: string;
    familyName: string;
    middleName: string;
    email: string;
    gender: number;
    birthDate: string;
    city: string;
    isConsentToPersonalData: boolean;
    isConsentToSms: boolean;
    isConsentToEmail: boolean;
    isConsentToAdditional: boolean;
    mobilePhone: string;
}

export interface BonusProfile {
    cardType?: string;
    cardNumber?: string;
    accumulatedBalance?: number;
    promoBalance?: number;
}

function isSuccess(value: unknown): boolean {
    return value === true || value === 'True' || value === 'true';
}

async function postJson<T>(url: string, body: object, requestError = typographed`Не удалось выполнить запрос. Попробуйте ещё раз`): Promise<T> {
    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(body),
        });
    } catch {
        throw new Error(requestError);
    }

    if (!response.ok) {
        throw new Error(requestError);
    }

    return response.json() as Promise<T>;
}

export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 ? `7${digits}` : digits;
}

export async function registerCard(data: RegistrationData): Promise<void> {
    const response = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
        '/endpoints/Customer/BonusRegister', data,
    );
    if (!isSuccess(response.result?.isSuccess)) {
        throw new Error(response.result?.errorMessage || typographed`Не удалось оформить карту`);
    }
}

export async function sendVerificationCode(mobilePhone: string): Promise<void> {
    const response = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
        '/endpoints/Customer/BonusSendVerificationCode', {mobilePhone}, typographed`Не удалось отправить код. Проверьте подключение к интернету и попробуйте ещё раз`,
    );
    if (!isSuccess(response.result?.isSuccess)) {
        throw new Error(response.result?.errorMessage || typographed`Не удалось отправить код`);
    }
}

export async function activateCard(mobilePhone: string, activationCode: string): Promise<void> {
    const response = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
        '/endpoints/Customer/BonusActivation', {mobilePhone, activationCode}, typographed`Неверный код или срок его действия истёк. Попробуйте ещё раз`,
    );
    if (!isSuccess(response.result?.isSuccess)) {
        throw new Error(response.result?.errorMessage || typographed`Неверный код — попробуйте ещё раз`);
    }
}

export async function getBonusProfile(): Promise<BonusProfile> {
    const response = await postJson<{result?: BonusProfile}>('/endpoints/Customer/BonusProfile', {});
    if (!response.result || typeof response.result !== 'object') {
        throw new Error(typographed`Не удалось загрузить данные карты`);
    }
    return response.result;
}

export async function refreshUser(): Promise<boolean> {
    const response = await postJson<{ result?: { token?: string } }>('/endpoints/Customer/RefreshLogin', {});
    const token = response.result?.token;
    if (!token) return false;
    const payload = token.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))))) as UserProfile;
    const current = getProfile() ?? {};
    for (const [key, value] of Object.entries(decoded)) {
        if (key.startsWith('Bonus')) current[key] = value;
    }
    window.localStorage.setItem('user', JSON.stringify(current));
    return true;
}
