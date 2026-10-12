import {normalizePhone, registerCard, type RegistrationData} from './api/customer-api';
import {sendBonusAccountRegistration} from './api/mindbox';
import type {UserProfile} from './model/profile';
import {typographed} from '@/shared/runtime/typography';
import {
    showMessage,
    type CoralPopupElement,
} from './ui/activation-view';
import {createRegistrationForm, parseBirthdate, validateRegistrationForm} from './ui/registration-view';
import {renderVerification} from './verification-flow';

export function renderRegistration(dialog: CoralPopupElement, profile: UserProfile): void {
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
        const data = new FormData(form);
        const registration: RegistrationData = {
            givenName: String(data.get('givenName') ?? '').trim(),
            familyName: String(data.get('familyName') ?? '').trim(),
            middleName: '',
            email: String(data.get('email') ?? ''),
            gender: Number(data.get('gender')),
            birthDate: parseBirthdate(String(data.get('birthDate') ?? ''))!,
            city: String(data.get('city') ?? '').trim(),
            isConsentToPersonalData: data.get('personal') === 'on',
            isConsentToSms: data.get('loyalty') === 'on',
            isConsentToEmail: data.get('loyalty') === 'on',
            isConsentToAdditional: data.get('offers') === 'on',
            mobilePhone: normalizePhone(String(data.get('mobilePhone') ?? '')),
        };

        try {
            if (submit) {
                submit.disabled = true;
                submit.textContent = typographed`Отправляем код…`;
            }
            form.dataset.state = 'sending';
            form.setAttribute('aria-busy', 'true');
            form.querySelector('.in-da-club-activation__error')?.remove();
            const registrationChanged = JSON.stringify(completedRegistration) !== JSON.stringify(registration);
            if (registrationChanged) {
                await registerCard(registration);
                sendBonusAccountRegistration(registration.city, profile.nameId);
                completedRegistration = registration;
            }
            await renderVerification(dialog, registration, profile.nameId);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : typographed`Не удалось оформить карту`);
            delete form.dataset.state;
            form.removeAttribute('aria-busy');
            if (submit) {
                submit.disabled = false;
                submit.textContent = typographed`Получить код по SMS`;
            }
        }
    });
}
