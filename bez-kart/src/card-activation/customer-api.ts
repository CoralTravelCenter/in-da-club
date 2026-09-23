import {getProfile, type UserProfile} from './profile';
import {requestJson} from './http';
import {typographed} from '../../../shared/runtime/typography';

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
    cardType?: 'Silver' | 'Gold' | 'Platinum';
    cardNumber?: string;
    accumulatedBalance?: number;
    promoBalance?: number;
}

interface ApiResult {
    isSuccess?: boolean | 'True' | 'true';
    errorMessage?: unknown;
}

const DEFAULT_REQUEST_ERROR = typographed`Не удалось выполнить запрос. Попробуйте ещё раз`;

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getResult(payload: unknown): Record<string, unknown> | null {
    if (!isRecord(payload) || !isRecord(payload.result)) return null;
    return payload.result;
}

function isSuccess(value: unknown): boolean {
    return value === true || value === 'True' || value === 'true';
}

function getErrorMessage(result: ApiResult, fallback: string): string {
    return typeof result.errorMessage === 'string' && result.errorMessage.trim()
        ? result.errorMessage
        : fallback;
}

async function postJson(url: string, body: object, requestError = DEFAULT_REQUEST_ERROR): Promise<unknown> {
    return await requestJson(url, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body),
    }, requestError);
}

async function runOperation(url: string, body: object, fallbackError: string): Promise<void> {
    const result = getResult(await postJson(url, body, fallbackError));
    if (!result || !isSuccess(result.isSuccess)) {
        throw new Error(getErrorMessage(result ?? {}, fallbackError));
    }
}

function optionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function normalizeBonusProfile(result: Record<string, unknown>): BonusProfile {
    const cardType = ['Silver', 'Gold', 'Platinum'].includes(String(result.cardType))
        ? result.cardType as BonusProfile['cardType']
        : undefined;

    return {
        cardType,
        cardNumber: typeof result.cardNumber === 'string' ? result.cardNumber : undefined,
        accumulatedBalance: optionalNumber(result.accumulatedBalance),
        promoBalance: optionalNumber(result.promoBalance),
    };
}

function decodeJwtPayload(token: string): UserProfile | null {
    try {
        const encoded = token.split('.')[1];
        if (!encoded) return null;

        const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(encoded.length / 4) * 4, '=');
        const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
        const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
        return isRecord(payload) ? payload as UserProfile : null;
    } catch {
        return null;
    }
}

export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `7${digits}`;
    return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
}

export async function registerCard(data: RegistrationData): Promise<void> {
    await runOperation('/endpoints/Customer/BonusRegister', data, typographed`Не удалось оформить карту`);
}

export async function sendVerificationCode(mobilePhone: string): Promise<void> {
    await runOperation(
        '/endpoints/Customer/BonusSendVerificationCode',
        {mobilePhone},
        typographed`Не удалось отправить код. Проверьте подключение к интернету и попробуйте ещё раз`,
    );
}

export async function activateCard(mobilePhone: string, activationCode: string): Promise<void> {
    await runOperation(
        '/endpoints/Customer/BonusActivation',
        {mobilePhone, activationCode},
        typographed`Неверный код или срок его действия истёк. Попробуйте ещё раз`,
    );
}

export async function getBonusProfile(): Promise<BonusProfile> {
    const result = getResult(await postJson('/endpoints/Customer/BonusProfile', {}));
    if (!result) throw new Error(typographed`Не удалось загрузить данные карты`);
    return normalizeBonusProfile(result);
}

export async function refreshUser(): Promise<boolean> {
    const result = getResult(await postJson('/endpoints/Customer/RefreshLogin', {}));
    const token = typeof result?.token === 'string' ? result.token : null;
    const decoded = token ? decodeJwtPayload(token) : null;
    if (!decoded) return false;

    const current = getProfile() ?? {};
    for (const [key, value] of Object.entries(decoded)) {
        if (key.startsWith('Bonus')) current[key] = value;
    }
    window.localStorage.setItem('user', JSON.stringify(current));
    return true;
}
