export interface UserProfile {
    name?: string;
    surname?: string;
    gender?: string | number;
    birthdate?: string;
    email?: string;
    mobilePhone?: string;
    BonusUserId?: string | number;
    BonusLevel?: unknown;

    [key: string]: unknown;
}

export function getStoredProfile(value?: string | null): UserProfile | null {
    try {
        const storedValue = value === undefined ? window.localStorage.getItem('user') : value;
        const profile: unknown = storedValue ? JSON.parse(storedValue) : null;
        return profile && typeof profile === 'object' && !Array.isArray(profile)
            ? profile as UserProfile
            : null;
    } catch {
        return null;
    }
}

export function setStoredProfile(profile: UserProfile): void {
    window.localStorage.setItem('user', JSON.stringify(profile));
}
