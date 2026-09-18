import {getProfile, waitForLogin, type UserProfile} from './profile';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode, type RegistrationData} from './customer-api';
import {applyConsents} from './consents';
import {typographed} from '@/shared/typography';
import {
    createDialog,
    createRegistrationForm,
    createVerificationForm,
    parseBirthdate,
    readVerificationCode,
    setStep,
    showExistingCardResult,
    showMessage,
    showRefreshRequiredResult,
    showSuccessResult,
    validateRegistrationForm,
    validateVerificationForm,
    type CoralPopupElement,
} from './activation-view';

const LOGIN_BUTTON_SELECTOR = '[class*="LoginButton_loginButton"]';

async function openPopup(popup: CoralPopupElement): Promise<void> {
    await customElements.whenDefined('coral-popup');
    await popup.show();
}

function rememberFirstStepHeight(dialog: CoralPopupElement): void {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    const height = Math.ceil(Math.max(stage.getBoundingClientRect().height, stage.scrollHeight));
    if (height > 0) dialog.style.setProperty('--bez-kart-activation-step-height', `${height}px`);
}

function renderRegistration(dialog: CoralPopupElement, profile: UserProfile): void {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;

    const form = createRegistrationForm(profile);
    stage.replaceChildren(form);

    let completedRegistration: RegistrationData | null = null;
    let consentsApplied = false;
    const acceptedDocuments = new Map<string, boolean>();
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
            form.querySelector('.bez-kart-activation__error')?.remove();
            const registrationChanged = JSON.stringify(completedRegistration) !== JSON.stringify(registration);
            if (registrationChanged) {
                await registerCard(registration);
                completedRegistration = registration;
                consentsApplied = false;
            }
            if (!consentsApplied) {
                await applyConsents(registration, acceptedDocuments);
                consentsApplied = true;
            }
            await renderVerification(dialog, registration);
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

async function renderVerification(dialog: CoralPopupElement, data: RegistrationData): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) throw new Error(typographed`Не удалось открыть шаг подтверждения`);

    await sendVerificationCode(data.mobilePhone);
    setStep(dialog, 1);
    dialog.setAttribute('aria-label', typographed`Введите код из SMS`);
    const form = createVerificationForm(data.mobilePhone);
    stage.replaceChildren(form);
    const resend = form.querySelector<HTMLButtonElement>('[data-resend-code]')!;
    let timer: number | undefined;
    const startResendCooldown = (): void => {
        let remaining = 60;
        resend.disabled = true;
        resend.dataset.state = 'cooldown';
        resend.removeAttribute('aria-busy');
        resend.innerHTML = `${typographed`Отправить код повторно через`} <span data-resend-seconds>60</span> ${typographed`сек.`}`;
        window.clearInterval(timer);
        timer = window.setInterval(() => {
            remaining -= 1;
            const seconds = resend.querySelector<HTMLElement>('[data-resend-seconds]');
            if (seconds) seconds.textContent = String(remaining);
            if (remaining > 0) return;
            window.clearInterval(timer);
            resend.disabled = false;
            resend.dataset.state = 'ready';
            resend.textContent = typographed`Отправить код повторно`;
        }, 1000);
    };
    startResendCooldown();
    resend.addEventListener('click', async () => {
        if (resend.disabled) return;
        resend.disabled = true;
        resend.dataset.state = 'sending';
        resend.setAttribute('aria-busy', 'true');
        resend.textContent = typographed`Отправляем код…`;
        form.querySelector('.bez-kart-activation__error')?.remove();
        try {
            await sendVerificationCode(data.mobilePhone);
            startResendCooldown();
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : typographed`Не удалось отправить код повторно`);
            resend.disabled = false;
            resend.dataset.state = 'ready';
            resend.removeAttribute('aria-busy');
            resend.textContent = typographed`Отправить код повторно`;
        }
    });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateVerificationForm(form)) return;
        const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
        if (submit?.disabled) return;
        const code = readVerificationCode(form);
        try {
            if (submit) {
                submit.disabled = true;
                submit.textContent = typographed`Активируем карту…`;
            }
            form.dataset.state = 'activating';
            form.setAttribute('aria-busy', 'true');
            form.querySelector('.bez-kart-activation__error')?.remove();
            await activateCard(data.mobilePhone, code);
            window.clearInterval(timer);
            await renderSuccess(dialog);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : typographed`Не удалось активировать карту`);
            delete form.dataset.state;
            form.removeAttribute('aria-busy');
            if (submit) {
                submit.disabled = false;
                submit.textContent = typographed`Активировать`;
            }
        }
    });
}

async function renderSuccess(dialog: CoralPopupElement): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    try {
        if (!await refreshUser()) {
            throw new Error(typographed`Не удалось обновить данные карты`);
        }
        const bonus = await getBonusProfile();
        const profile = getProfile();
        if (!profile) throw new Error(typographed`Не удалось обновить данные карты`);
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', typographed`Карта активирована`);
        showSuccessResult(stage, bonus, profile);
    } catch {
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', typographed`Не удалось обновить данные карты`);
        showRefreshRequiredResult(stage);
    }
}

async function showExistingCard(profile: UserProfile): Promise<void> {
    const dialog = createDialog();
    dialog.setAttribute('aria-label', typographed`У вас уже есть карта CoralBonus`);
    dialog.querySelector('.bez-kart-activation__banner')?.remove();
    dialog.querySelector('.bez-kart-activation__steps')?.remove();
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (stage) {
        stage.innerHTML = `<div class="bez-kart-activation__status" role="status">${typographed`Загружаем данные карты…`}</div>`;
    }
    await openPopup(dialog);
    if (stage) {
        try {
            showExistingCardResult(stage, await getBonusProfile(), profile);
        } catch {
            showRefreshRequiredResult(stage);
        }
    }
}

let activationPending = false;

export async function requestCardActivation(): Promise<void> {
    if (activationPending) return;
    activationPending = true;
    try {
        let profile = getProfile();
        if (!profile) {
            const loginButton = document.querySelector<HTMLElement>(LOGIN_BUTTON_SELECTOR);
            if (!loginButton) {
                console.error('CoralBonus: login button was not found');
                return;
            }
            loginButton.click();
            profile = await waitForLogin();
        }
        if (!profile) return;
        if (profile.BonusUserId) {
            await showExistingCard(profile);
            return;
        }
        const dialog = createDialog();
        renderRegistration(dialog, profile);
        await openPopup(dialog);
        rememberFirstStepHeight(dialog);
    } catch (error) {
        console.error('CoralBonus: failed to open card activation', error);
    } finally {
        activationPending = false;
    }
}
