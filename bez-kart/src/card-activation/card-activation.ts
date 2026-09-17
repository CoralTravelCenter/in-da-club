import {getProfile, waitForLogin, type UserProfile} from './profile';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode, type RegistrationData} from './customer-api';
import {applyConsents} from './consents';
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
    type CoralPopupElement,
} from './activation-view';

const LOGIN_BUTTON_SELECTOR = '[class*="LoginButton_loginButton"]';

async function openPopup(popup: CoralPopupElement): Promise<void> {
    await customElements.whenDefined('coral-popup');
    await popup.show();
}

function renderRegistration(dialog: CoralPopupElement, profile: UserProfile): void {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;

    const form = createRegistrationForm(profile);
    stage.replaceChildren(form);

    let completedRegistration: RegistrationData | null = null;
    let consentsApplied = false;
    const acceptedDocuments = new Set<string>();
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateRegistrationForm(form)) return;
        const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
        if (submit?.disabled) return;
        const data = new FormData(form);
        const registration: RegistrationData = completedRegistration ?? {
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
            if (submit) submit.disabled = true;
            form.querySelector('.bez-kart-activation__error')?.remove();
            if (!completedRegistration) {
                await registerCard(registration);
                completedRegistration = registration;
            }
            if (!consentsApplied) {
                await applyConsents(registration, acceptedDocuments);
                consentsApplied = true;
            }
            await renderVerification(dialog, registration);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : 'Не удалось оформить карту');
            if (submit) submit.disabled = false;
        }
    });
}

async function renderVerification(dialog: CoralPopupElement, data: RegistrationData): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) throw new Error('Не удалось открыть шаг подтверждения');

    const status = document.createElement('div');
    status.className = 'bez-kart-activation__status';
    status.setAttribute('role', 'status');
    status.textContent = 'Отправляем код активации…';
    stage.append(status);
    try {
        await sendVerificationCode(data.mobilePhone);
    } finally {
        status.remove();
    }
    setStep(dialog, 1);
    dialog.setAttribute('aria-label', 'Введите код из SMS');
    const form = createVerificationForm(data.mobilePhone);
    stage.replaceChildren(form);
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
        if (submit?.disabled) return;
        const code = readVerificationCode(form);
        try {
            if (submit) submit.disabled = true;
            form.querySelector('.bez-kart-activation__error')?.remove();
            await activateCard(data.mobilePhone, code);
            await renderSuccess(dialog);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : 'Не удалось активировать карту');
            if (submit) submit.disabled = false;
        }
    });
}

async function renderSuccess(dialog: CoralPopupElement): Promise<void> {
    setStep(dialog, 2);
    dialog.setAttribute('aria-label', 'Карта активирована');
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    stage.innerHTML = '<div class="bez-kart-activation__status" role="status">Проверяем…</div>';
    try {
        if (!await refreshUser()) {
            throw new Error('Не удалось обновить данные карты');
        }
        const bonus = await getBonusProfile();
        const profile = getProfile();
        if (!profile) throw new Error('Не удалось обновить данные карты');
        showSuccessResult(stage, bonus, profile);
    } catch {
        showRefreshRequiredResult(stage);
    }
}

async function showExistingCard(profile: UserProfile): Promise<void> {
    const dialog = createDialog();
    dialog.setAttribute('aria-label', 'У вас уже есть карта CoralBonus');
    dialog.querySelector('.bez-kart-activation__banner')?.remove();
    dialog.querySelector('.bez-kart-activation__steps')?.remove();
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (stage) {
        stage.innerHTML = '<div class="bez-kart-activation__status" role="status">Загружаем данные карты…</div>';
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
    } catch (error) {
        console.error('CoralBonus: failed to open card activation', error);
    } finally {
        activationPending = false;
    }
}
