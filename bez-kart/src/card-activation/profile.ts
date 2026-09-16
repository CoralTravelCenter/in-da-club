export interface UserProfile {
    name?: string;
    surname?: string;
    gender?: string | number;
    birthdate?: string;
    email?: string;
    mobilePhone?: string;
    BonusUserId?: string | number;

    [key: string]: unknown;
}

export function getProfile(): UserProfile | null {
    try {
        const value = window.localStorage.getItem('user');
        const profile: unknown = value ? JSON.parse(value) : null;
        return profile && typeof profile === 'object' && !Array.isArray(profile)
            ? profile as UserProfile
            : null;
    } catch {
        return null;
    }
}

export function waitForLogin(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
        const initialProfile = getProfile();
        if (initialProfile) {
            resolve(initialProfile);
            return;
        }

        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const profile = getProfile();
            if (profile) {
                finish(profile);
            } else if (Date.now() - startedAt > 120_000) {
                finish(null);
            }
        }, 300);

        const onClick = (event: MouseEvent): void => {
            if ((event.target as Element | null)?.closest('.ant-modal-close')) {
                finish(null);
            }
        };
        const onKeydown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                finish(null);
            }
        };
        const finish = (profile: UserProfile | null): void => {
            window.clearInterval(interval);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKeydown);
            resolve(profile);
        };

        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKeydown);
    });
}

export function formatBirthdate(value?: string): string {
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
