import {ACTIVATION_DIALOG_ID} from './activation-view';
import {content} from '@/content/content';
import {textToSafeHtml} from '@/shared/runtime/text';

export function validateVerificationForm(form: HTMLFormElement): boolean {
    form.querySelector('.in-da-club-activation__field-error')?.remove();
    const digits = [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')];
    digits.forEach((input) => input.removeAttribute('aria-invalid'));
    if (digits.every((input) => /^\d$/.test(input.value))) return true;
    digits.forEach((input) => input.setAttribute('aria-invalid', 'true'));
    const error = document.createElement('span');
    error.className = 'in-da-club-activation__field-error';
    error.textContent = content.activation.validation.codeInvalid;
    form.querySelector('.in-da-club-activation__code-input')?.after(error);
    digits.find((input) => !input.value)?.focus();
    return false;
}

export function createVerificationForm(mobilePhone: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'in-da-club-activation__verify';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${ACTIVATION_DIALOG_ID}-title">${textToSafeHtml(content.activation.verification.title)}</h2>
        <p>${textToSafeHtml(content.activation.verification.sentTo)}<br><strong data-activation-phone></strong></p>
        <div class="in-da-club-activation__code-input" role="group" aria-label="${textToSafeHtml(content.activation.verification.codeLabel)}">
            ${Array.from({length: 6}, (_, index) => `<input data-code-digit inputmode="numeric" pattern="[0-9]" maxlength="1" placeholder=" " autocomplete="${index === 0 ? 'one-time-code' : 'off'}" aria-label="${textToSafeHtml(content.activation.verification.digitLabel)} ${index + 1} ${textToSafeHtml(content.activation.steps.of)}${textToSafeHtml(content.activation.steps.separator)}6" required>`).join('')}
        </div>
        <button class="in-da-club-activation__submit" type="submit">${textToSafeHtml(content.activation.verification.activate)}</button>
        <button class="in-da-club-activation__resend" type="button" data-resend-code disabled>${textToSafeHtml(content.activation.verification.resendCountdown)} <span data-resend-seconds>01:00</span></button>
        `;
    const phone = form.querySelector<HTMLElement>('[data-activation-phone]');
    if (phone) phone.textContent = mobilePhone;
    const digits = [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')];
    digits.forEach((input, index) => {
        input.addEventListener('input', () => {
            form.querySelector('.in-da-club-activation__field-error')?.remove();
            digits.forEach((digit) => digit.removeAttribute('aria-invalid'));
            input.value = input.value.replace(/\D/g, '').slice(0, 1);
            if (input.value) digits[index + 1]?.focus();
        });
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace' && !input.value) digits[index - 1]?.focus();
        });
        input.addEventListener('paste', (event) => {
            const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6 - index);
            if (!pasted) return;
            event.preventDefault();
            [...pasted].forEach((digit, offset) => { digits[index + offset].value = digit; });
            digits[Math.min(index + pasted.length, 5)].focus();
        });
    });
    return form;
}

export function readVerificationCode(form: HTMLFormElement): string {
    return [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')].map((input) => input.value).join('');
}
