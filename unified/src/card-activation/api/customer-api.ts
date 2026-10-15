import type {RegistrationData} from '../model/registration';
import {getStoredProfile, setStoredProfile, type UserProfile} from '@/customer/profile-storage';
import {requestJson} from './http';
import {content} from '@/content/content';

export {normalizePhone, type RegistrationData} from '../model/registration';

interface ApiResult {
    isSuccess?: boolean | 'True' | 'true';
    errorMessage?: unknown;
}

const DEFAULT_REQUEST_ERROR = content.activation.errors.request;

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

export async function registerCard(data: RegistrationData): Promise<void> {
    await runOperation('/endpoints/Customer/BonusRegister', data, content.activation.errors.register);
}

export async function sendVerificationCode(mobilePhone: string): Promise<void> {
    await runOperation(
        '/endpoints/Customer/BonusSendVerificationCode',
        {mobilePhone},
        content.activation.errors.sendCode,
    );
}

export async function activateCard(mobilePhone: string, activationCode: string): Promise<void> {
    await runOperation(
        '/endpoints/Customer/BonusActivation',
        {mobilePhone, activationCode},
        content.activation.errors.activate,
    );
}

export async function refreshUser(): Promise<boolean> {
    const result = getResult(await postJson('/endpoints/Customer/RefreshLogin', {}));
    const token = typeof result?.token === 'string' ? result.token : null;
    const decoded = token ? decodeJwtPayload(token) : null;
    if (!decoded || !decoded.BonusUserId) return false;

    const current = getStoredProfile() ?? {};
    for (const [key, value] of Object.entries(decoded)) {
        if (key.startsWith('Bonus')) current[key] = value;
    }
    setStoredProfile(current);
    return getStoredProfile()?.BonusUserId === decoded.BonusUserId;
}
