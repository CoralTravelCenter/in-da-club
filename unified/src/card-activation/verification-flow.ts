import {activateCard, getBonusProfile, refreshUser, sendVerificationCode, type RegistrationData} from './api/customer-api';
import {sendBonusAccountActivation} from './api/mindbox';
import {getProfile} from './model/profile';
import {content} from '@/content/content';
import {textToSafeHtml} from '@/shared/runtime/text';
import {
    setStep,
    showMessage,
    type CoralPopupElement,
} from './ui/activation-view';
import {showRefreshRequiredResult, showSuccessResult} from './ui/activation-result-view';
import {createVerificationForm, readVerificationCode, validateVerificationForm} from './ui/verification-view';

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
        button.innerHTML = `${textToSafeHtml(content.activation.verification.resendCountdown)} <span data-resend-seconds>${formatTime(remaining)}</span>`;
        stop();
        timer = window.setInterval(() => {
            remaining -= 1;
            const seconds = button.querySelector<HTMLElement>('[data-resend-seconds]');
            if (seconds) seconds.textContent = formatTime(remaining);
            if (remaining > 0) return;
            stop();
            button.disabled = false;
            button.dataset.state = 'ready';
            button.textContent = content.activation.verification.resend;
        }, 1000);
    };
    return {start, stop};
}

async function renderSuccess(dialog: CoralPopupElement, city: string, clientId: unknown): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.in-da-club-activation__stage');
    if (!stage) return;
    try {
        if (!await refreshUser()) {
            throw new Error(content.activation.errors.refreshCard);
        }
        const bonus = await getBonusProfile();
        if (!bonus.cardType || !bonus.cardNumber?.trim()) {
            throw new Error(content.activation.errors.loadCard);
        }
        const profile = getProfile();
        if (!profile) throw new Error(content.activation.errors.refreshCard);
        sendBonusAccountActivation(city, bonus.cardType, bonus.cardNumber, clientId);
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', content.activation.dialog.activated);
        showSuccessResult(stage, bonus, profile);
    } catch {
        setStep(dialog, 2);
        dialog.setAttribute('aria-label', content.activation.dialog.refreshFailed);
        showRefreshRequiredResult(stage);
    }
}

export async function renderVerification(dialog: CoralPopupElement, data: RegistrationData, clientId: unknown): Promise<void> {
    const stage = dialog.querySelector<HTMLElement>('.in-da-club-activation__stage');
    if (!stage) throw new Error(content.activation.errors.openVerification);

    await sendVerificationCode(data.mobilePhone);
    setStep(dialog, 1);
    dialog.setAttribute('aria-label', content.activation.dialog.verification);
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
        resend.textContent = content.activation.verification.resending;
        form.querySelector('.in-da-club-activation__error')?.remove();
        try {
            await sendVerificationCode(data.mobilePhone);
            cooldown.start();
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : content.activation.errors.resendCode);
            resend.disabled = false;
            resend.dataset.state = 'ready';
            resend.removeAttribute('aria-busy');
            resend.textContent = content.activation.verification.resend;
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
                submit.textContent = content.activation.verification.activating;
            }
            form.dataset.state = 'activating';
            form.setAttribute('aria-busy', 'true');
            form.querySelector('.in-da-club-activation__error')?.remove();
            await activateCard(data.mobilePhone, code);
            cooldown.stop();
            await renderSuccess(dialog, data.city, clientId);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : content.activation.errors.activateCard);
            delete form.dataset.state;
            form.removeAttribute('aria-busy');
            if (submit) {
                submit.disabled = false;
                submit.textContent = content.activation.verification.activate;
            }
        }
    });
}
