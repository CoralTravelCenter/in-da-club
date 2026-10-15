import {getStoredProfile, type UserProfile} from '@/customer/profile-storage';

export function waitForLogin(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
        const initialProfile = getStoredProfile();
        if (initialProfile) {
            resolve(initialProfile);
            return;
        }

        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const profile = getStoredProfile();
            if (profile) {
                finish(profile);
            } else if (Date.now() - startedAt > 120_000) {
                finish(null);
            }
        }, 300);

        const onClick = (event: MouseEvent): void => {
            if ((event.target as Element | null)?.closest('.ant-modal-close')) finish(null);
        };
        const onKeydown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') finish(null);
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
