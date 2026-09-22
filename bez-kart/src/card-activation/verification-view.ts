import {ACTIVATION_DIALOG_ID} from './activation-view';
import {typographed} from '../../../shared/typography';

export function validateVerificationForm(form: HTMLFormElement): boolean {
    form.querySelector('.bez-kart-activation__field-error')?.remove();
    const digits = [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')];
    digits.forEach((input) => input.removeAttribute('aria-invalid'));
    if (digits.every((input) => /^\d$/.test(input.value))) return true;
    digits.forEach((input) => input.setAttribute('aria-invalid', 'true'));
    const error = document.createElement('span');
    error.className = 'bez-kart-activation__field-error';
    error.textContent = typographed`Введите код из 6 цифр`;
    form.querySelector('.bez-kart-activation__code-input')?.after(error);
    digits.find((input) => !input.value)?.focus();
    return false;
}

export function createVerificationForm(mobilePhone: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__verify';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${ACTIVATION_DIALOG_ID}-title">${typographed`Введите код из SMS`}</h2>
        <p>${typographed`Отправили код активации на номер`}<br><strong data-activation-phone></strong></p>
        <div class="bez-kart-activation__code-input" role="group" aria-label="${typographed`Код из SMS`}">
            ${Array.from({length: 6}, (_, index) => `<input data-code-digit inputmode="numeric" pattern="[0-9]" maxlength="1" placeholder=" " autocomplete="${index === 0 ? 'one-time-code' : 'off'}" aria-label="Цифра ${index + 1} из 6" required>`).join('')}
        </div>
        <button class="bez-kart-activation__submit" type="submit">${typographed`Активировать`}</button>
        <button class="bez-kart-activation__resend" type="button" data-resend-code disabled>${typographed`Отправить код повторно через`} <span data-resend-seconds>01:00</span></button>
        `;
    const phone = form.querySelector<HTMLElement>('[data-activation-phone]');
    if (phone) phone.textContent = mobilePhone;
    const digits = [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')];
    digits.forEach((input, index) => {
        input.addEventListener('input', () => {
            form.querySelector('.bez-kart-activation__field-error')?.remove();
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
