import {cities} from './cities';

const knownCities = new Set<string>(cities);

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
    Promo: string;
    FromPageUrl: string;
}

export function isKnownCity(value: string): boolean {
    return knownCities.has(value.trim());
}

export function isValidPhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8')));
}

export function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) return `7${digits}`;
    return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
}

export function displayPhone(value?: string): string {
    const digits = (value ?? '').replace(/\D/g, '');
    const national = digits.length === 10
        ? digits
        : digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
            ? digits.slice(1)
            : '';
    return national
        ? `+7 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 8)}-${national.slice(8)}`
        : '';
}

function formatBirthdate(value?: string): string {
    if (!value) return '';
    const sourceDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (sourceDate) {
        const [, month, day, year] = sourceDate;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function displayBirthdate(value?: string): string {
    const isoDate = formatBirthdate(value);
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '';
}

export function parseBirthdate(value: string): string | null {
    const match = value.match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null;
    return `${year}-${month}-${day}`;
}

export function registrationDataFromForm(
    formData: FormData,
    promo: string,
    pagePath: string,
): RegistrationData {
    return {
        givenName: String(formData.get('givenName') ?? '').trim(),
        familyName: String(formData.get('familyName') ?? '').trim(),
        middleName: '',
        email: String(formData.get('email') ?? ''),
        gender: Number(formData.get('gender')),
        birthDate: parseBirthdate(String(formData.get('birthDate') ?? ''))!,
        city: String(formData.get('city') ?? '').trim(),
        isConsentToPersonalData: formData.get('personal') === 'on',
        isConsentToSms: formData.get('loyalty') === 'on',
        isConsentToEmail: formData.get('loyalty') === 'on',
        isConsentToAdditional: formData.get('offers') === 'on',
        mobilePhone: normalizePhone(String(formData.get('mobilePhone') ?? '')),
        Promo: promo,
        FromPageUrl: pagePath,
    };
}
