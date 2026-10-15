import {registerBonusAccount} from './activation-operations';
import {registrationDataFromForm, type RegistrationData} from './model/registration';
import {content} from '@/content/content';
import type {UserProfile} from '@/customer/profile-storage';
import {
    showMessage,
    type CoralPopupElement,
} from './ui/activation-view';
import {createRegistrationForm, validateRegistrationForm} from './ui/registration-view';
import {renderVerification} from './verification-flow';

export function renderRegistration(dialog: CoralPopupElement, profile: UserProfile, promo: string): void {
    const stage = dialog.querySelector<HTMLElement>('.in-da-club-activation__stage');
    if (!stage) return;

    const form = createRegistrationForm(profile);
    stage.replaceChildren(form);

    let completedRegistration: RegistrationData | null = null;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateRegistrationForm(form)) return;
        const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
        if (submit?.disabled) return;
        const registration = registrationDataFromForm(new FormData(form), promo, location.pathname);

        try {
            if (submit) {
                submit.disabled = true;
                submit.textContent = content.activation.registration.submitting;
            }
            form.dataset.state = 'sending';
            form.setAttribute('aria-busy', 'true');
            form.querySelector('.in-da-club-activation__error')?.remove();
            const registrationChanged = JSON.stringify(completedRegistration) !== JSON.stringify(registration);
            if (registrationChanged) {
                await registerBonusAccount(registration, profile.nameId);
                completedRegistration = registration;
            }
            await renderVerification(dialog, registration, profile.nameId);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : content.activation.errors.register);
            delete form.dataset.state;
            form.removeAttribute('aria-busy');
            if (submit) {
                submit.disabled = false;
                submit.textContent = content.activation.registration.submit;
            }
        }
    });
}
