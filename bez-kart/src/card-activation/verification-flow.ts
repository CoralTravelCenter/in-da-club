import {getProfile} from './profile';
import {activateCard, getBonusProfile, refreshUser, sendVerificationCode, type RegistrationData} from './customer-api';
import {typographed} from '../../../shared/runtime/typography';
import {
    setStep,
    showMessage,
    type CoralPopupElement,
} from './activation-view';
import {createVerificationForm, readVerificationCode, validateVerificationForm} from './verification-view';
import {showRefreshRequiredResult, showSuccessResult} from './activation-result-view';
import {sendBonusAccountActivation} from './mindbox';

interface ResendCooldown {
    start: () => void;
    stop: () => void;
}

function createResendCooldown(button: HTMLButtonElement): ResendCooldown {
    let timer: number | undefined;
    const stop = (): void => window.clearInterval(timer);
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    const start = (): void => {
        let remaining = 60;
        button.disabled = true;
        button.dataset.state = 'cooldown';
        button.removeAttribute('aria-busy');
        button.innerHTML = `${typographed`Отправить код повторно через`} <span data-resend-seconds>${formatTime(remaining)}</span>`;
        stop();
        timer = window.setInterval(() => {
            remaining -= 1;
            const seconds = button.querySelector<HTMLElement>('[data-resend-seconds]');
            if (seconds) seconds.textContent = formatTime(remaining);
            if (remaining > 0) return;
            stop();
            button.disabled = false;
            button.dataset.state = 'ready';
            button.textContent = typographed`Отправить код повторно`;
        }, 1000);
    };
    return {start, stop};
}

async function renderSuccess(dialog: CoralPopupElement, city: string): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    try {
        if (!await refreshUser()) {
            throw new Error(typographed`Не удалось обновить данные карты`);
        }
        const bonus = await getBonusProfile();
        const profile = getProfile();
        if (!profile) throw new Error(typographed`Не удалось обновить данные карты`);
        sendBonusAccountActivation(city, bonus.cardType, bonus.cardNumber);
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', typographed`Карта активирована`);
        showSuccessResult(stage, bonus, profile);
    } catch {
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', typographed`Не удалось обновить данные карты`);
        showRefreshRequiredResult(stage);
    }
}

export async function renderVerification(dialog: CoralPopupElement, data: RegistrationData): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) throw new Error(typographed`Не удалось открыть шаг подтверждения`);

    await sendVerificationCode(data.mobilePhone);
    setStep(dialog, 1);
    dialog.setAttribute('aria-label', typographed`Введите код из SMS`);
    const form = createVerificationForm(data.mobilePhone);
    stage.replaceChildren(form);
    const resend = form.querySelector<HTMLButtonElement>('[data-resend-code]')!;
    const cooldown = createResendCooldown(resend);
    cooldown.start();
    resend.addEventListener('click', async () => {
        if (resend.disabled) return;
        resend.disabled = true;
        resend.dataset.state = 'sending';
        resend.setAttribute('aria-busy', 'true');
        resend.textContent = typographed`Отправляем код…`;
        form.querySelector('.bez-kart-activation__error')?.remove();
        try {
            await sendVerificationCode(data.mobilePhone);
            cooldown.start();
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
            cooldown.stop();
            await renderSuccess(dialog, data.city);
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
