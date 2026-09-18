import {formatBirthdate, type UserProfile} from './profile';
import {cities} from './cities';
import type {BonusProfile} from './customer-api';

export interface CoralPopupElement extends HTMLElement {
    show: () => Promise<void> | void;
    hide: () => void;
}

const DIALOG_ID = 'bez-kart-card-activation';
const knownCities = new Set<string>(cities);

function assetUrl(path: string): string {
    return `${__PUBLIC_ASSETS_BASE__}/${path}`;
}

function displayBirthdate(value?: string): string {
    const isoDate = formatBirthdate(value);
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '';
}

export function parseBirthdate(value: string): string | null {
    const match = value.match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
        return null;
    }
    return `${year}-${month}-${day}`;
}

export function validateRegistrationForm(form: HTMLFormElement): boolean {
    clearValidationErrors(form);
    const city = form.elements.namedItem('city') as HTMLInputElement;
    const birthDate = form.elements.namedItem('birthDate') as HTMLInputElement;
    const fields: Array<[HTMLInputElement | null, string]> = [
        [form.elements.namedItem('familyName') as HTMLInputElement, 'Укажите фамилию'],
        [form.elements.namedItem('givenName') as HTMLInputElement, 'Укажите имя'],
        [form.querySelector<HTMLInputElement>('input[name="gender"]:checked'), 'Выберите пол'],
        [birthDate, 'Укажите дату рождения'],
        [city, 'Укажите город'],
        [form.elements.namedItem('email') as HTMLInputElement, 'Укажите электронную почту'],
        [form.elements.namedItem('mobilePhone') as HTMLInputElement, 'Укажите телефон'],
        [form.elements.namedItem('personal') as HTMLInputElement, 'Подтвердите согласие на обработку персональных данных'],
        [form.elements.namedItem('loyalty') as HTMLInputElement, 'Подтвердите согласие с правилами программы'],
    ];

    for (const [field, message] of fields) {
        if (!field || (field.type === 'checkbox' ? !field.checked : !field.value.trim())) {
            const target = field ?? form.querySelector<HTMLInputElement>('input[name="gender"]');
            if (target) showFieldError(target, message);
        }
    }
    if (birthDate.value && !parseBirthdate(birthDate.value)) showFieldError(birthDate, 'Укажите корректную дату рождения');
    if (city.value && !knownCities.has(city.value.trim())) showFieldError(city, 'Укажите город из списка');
    const email = form.elements.namedItem('email') as HTMLInputElement;
    if (email.value && !email.validity.valid) showFieldError(email, 'Укажите корректную электронную почту');

    const firstInvalid = form.querySelector<HTMLInputElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
    return !firstInvalid;
}

function clearValidationErrors(form: HTMLFormElement): void {
    form.querySelectorAll('.bez-kart-activation__field-error').forEach((error) => error.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
}

function showFieldError(field: HTMLInputElement, message: string): void {
    if (field.getAttribute('aria-invalid') === 'true') return;
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'bez-kart-activation__field-error';
    error.textContent = message;
    const container = field.type === 'radio'
        ? field.closest('fieldset')
        : field.type === 'checkbox'
            ? field.closest('label')
            : field.closest('label') ?? field.parentElement;
    container?.append(error);
}

function clearFieldError(field: HTMLInputElement): void {
    const container = field.type === 'radio'
        ? field.closest('fieldset')
        : field.type === 'checkbox'
            ? field.closest('label')
            : field.closest('label') ?? field.parentElement;
    container?.querySelector('.bez-kart-activation__field-error')?.remove();

    if (field.type === 'radio') {
        field.form?.querySelectorAll<HTMLInputElement>(`input[name="${field.name}"]`)
            .forEach((radio) => radio.removeAttribute('aria-invalid'));
        return;
    }
    field.removeAttribute('aria-invalid');
}

function wireValidationReset(form: HTMLFormElement): void {
    const clearChangedField = (event: Event): void => {
        if (event.target instanceof HTMLInputElement) clearFieldError(event.target);
    };
    form.addEventListener('input', clearChangedField);
    form.addEventListener('change', clearChangedField);
}

export function validateVerificationForm(form: HTMLFormElement): boolean {
    form.querySelector('.bez-kart-activation__field-error')?.remove();
    const digits = [...form.querySelectorAll<HTMLInputElement>('[data-code-digit]')];
    digits.forEach((input) => input.removeAttribute('aria-invalid'));
    if (digits.every((input) => /^\d$/.test(input.value))) return true;
    digits.forEach((input) => input.setAttribute('aria-invalid', 'true'));
    const error = document.createElement('span');
    error.className = 'bez-kart-activation__field-error';
    error.textContent = 'Введите код из 6 цифр';
    form.querySelector('.bez-kart-activation__code-input')?.after(error);
    digits.find((input) => !input.value)?.focus();
    return false;
}

function wireCitySuggestions(form: HTMLFormElement): void {
    const input = form.elements.namedItem('city') as HTMLInputElement;
    const list = form.querySelector<HTMLUListElement>('.bez-kart-activation__city-options')!;
    const hide = (): void => {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
    };
    const update = (): void => {
        input.setCustomValidity('');
        const query = input.value.trim().toUpperCase();
        const matches = query ? cities.filter((name) =>
            name.split(/[\s-]/).some((part) => part.toUpperCase().startsWith(query)),
        ).slice(0, 5) : [];
        list.replaceChildren(...matches.map((name) => {
            const item = document.createElement('li');
            item.setAttribute('role', 'option');
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = name;
            button.addEventListener('click', () => {
                input.value = name;
                hide();
                input.focus();
            });
            item.append(button);
            return item;
        }));
        list.hidden = matches.length === 0;
        input.setAttribute('aria-expanded', String(matches.length > 0));
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') hide();
        if (event.key === 'ArrowDown' && !list.hidden) {
            event.preventDefault();
            list.querySelector('button')?.focus();
        }
    });
    list.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hide();
            input.focus();
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

        const buttons = [...list.querySelectorAll<HTMLButtonElement>('button')];
        const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (currentIndex === -1) return;

        event.preventDefault();
        if (event.key === 'ArrowUp' && currentIndex === 0) {
            input.focus();
            return;
        }

        const nextIndex = event.key === 'ArrowDown'
            ? Math.min(currentIndex + 1, buttons.length - 1)
            : currentIndex - 1;
        buttons[nextIndex]?.focus();
    });
}

function wireBirthdateMask(form: HTMLFormElement): void {
    const input = form.elements.namedItem('birthDate') as HTMLInputElement;
    input.addEventListener('input', () => {
        input.setCustomValidity('');
        const digits = input.value.replace(/\D/g, '').slice(0, 8);
        input.value = digits.length <= 2 ? digits
            : digits.length <= 4 ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
                : `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
    });
}

export function setStep(dialog: CoralPopupElement, step: number): void {
    const steps = dialog.querySelector<HTMLElement>('.bez-kart-activation__steps');
    steps?.setAttribute('aria-label', `Шаг ${step + 1} из 3`);
    dialog.querySelectorAll<HTMLElement>('[data-step-mark]').forEach((mark, index) => {
        mark.dataset.state = index < step ? 'complete' : index === step ? 'current' : 'upcoming';
        if (index === step) {
            mark.setAttribute('aria-current', 'step');
        } else {
            mark.removeAttribute('aria-current');
        }
    });
}

export function showMessage(container: HTMLElement, message: string): void {
    let error = container.querySelector<HTMLElement>('.bez-kart-activation__error');
    if (!error) {
        error = document.createElement('p');
        error.className = 'bez-kart-activation__error';
        error.setAttribute('role', 'alert');
        container.append(error);
    }
    error.textContent = message;
}

export function createDialog(): CoralPopupElement {
    document.getElementById(DIALOG_ID)?.remove();
    const dialog = document.createElement('coral-popup') as CoralPopupElement;
    dialog.id = DIALOG_ID;
    dialog.className = 'bez-kart-activation';
    dialog.setAttribute('aria-label', 'Оформление карты');
    dialog.innerHTML = `
        <coral-button class="bez-kart-activation__close" trait="pale" shape="pill" size="small">
            <button type="button" style="position: absolute; z-index: 1; top: calc(-31px - 8px); right: 0;">Закрыть</button>
        </coral-button>
        <div class="bez-kart-activation__body">
            <div class="bez-kart-activation__banner" aria-hidden="true"></div>
            <div class="bez-kart-activation__panel">
                <div class="bez-kart-activation__steps" role="group" aria-label="Шаг 1 из 3">
                    <span data-step-mark data-state="current" aria-current="step">1</span><i></i>
                    <span data-step-mark data-state="upcoming">2</span><i></i>
                    <span data-step-mark data-state="upcoming">3</span>
                </div>
                <div class="bez-kart-activation__stage"></div>
            </div>
        </div>`;

    dialog.querySelector<HTMLButtonElement>('.bez-kart-activation__close button')?.addEventListener('click', () => dialog.hide());

    document.body.append(dialog);
    return dialog;
}

export function createRegistrationForm(profile: UserProfile): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__form';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${DIALOG_ID}-title">Оформление карты</h2>
        <label><span>Фамилия <b>*</b></span><input name="familyName" required autocomplete="family-name"></label>
        <label><span>Имя <b>*</b></span><input name="givenName" required autocomplete="given-name"></label>
        <div class="bez-kart-activation__row">
            <fieldset>
                <legend>Пол <b>*</b></legend>
                <div class="bez-kart-activation__gender-options">
                    <label><input type="radio" name="gender" value="0" required><span>М</span></label>
                    <label><input type="radio" name="gender" value="1"><span>Ж</span></label>
                </div>
            </fieldset>
            <label><span>Дата рождения <b>*</b></span><input name="birthDate" required inputmode="numeric" placeholder="ДД / ММ / ГГГГ" autocomplete="bday"></label>
        </div>
        <div class="bez-kart-activation__city"><label for="bez-kart-city"><span>Город <b>*</b></span></label><input id="bez-kart-city" name="city" required autocomplete="address-level2" aria-autocomplete="list" aria-controls="bez-kart-city-options" aria-expanded="false"><ul id="bez-kart-city-options" class="bez-kart-activation__city-options" role="listbox" hidden></ul></div>
        <label><span>Электронная почта <b>*</b></span><input type="email" name="email" required readonly autocomplete="email"></label>
        <label><span>Телефон <b>*</b></span><input type="tel" name="mobilePhone" required readonly autocomplete="tel"></label>
        <div class="bez-kart-activation__consents">
            <label><input class="visually-hidden" type="checkbox" name="personal" required><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span><b>*</b> Даю согласие на обработку персональных данных. <a href="https://cdn.coral.ru/content/doc/legal/privacy_policy_coral.pdf" target="_blank" rel="noopener">Политика обработки персональных данных</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="loyalty" required><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span><b>*</b> Ознакомлен и согласен с <a href="https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf" target="_blank" rel="noopener">Правилами Программы лояльности</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="offers"><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span>Даю согласие на получение новостей, акций, специальных предложений, в том числе по турам.</span></label>
        </div>
        <button class="bez-kart-activation__submit" type="submit">Получить код по SMS</button>`;

    const setValue = (name: string, value: string): void => {
        const input = form.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = value;
    };
    setValue('familyName', profile.surname ?? '');
    setValue('givenName', profile.name ?? '');
    setValue('birthDate', displayBirthdate(profile.birthdate));
    setValue('email', profile.email ?? '');
    setValue('mobilePhone', profile.mobilePhone ?? '');
    const gender = String(profile.gender ?? '').toUpperCase();
    const genderInput = form.querySelector<HTMLInputElement>(`input[name="gender"][value="${gender === 'F' || gender === '1' ? '1' : '0'}"]`);
    if (genderInput) genderInput.checked = true;

    wireCitySuggestions(form);
    wireBirthdateMask(form);
    wireValidationReset(form);

    return form;
}

export function createVerificationForm(mobilePhone: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__verify';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${DIALOG_ID}-title">Введите код из SMS</h2>
        <p>Отправили код активации на номер<br><strong data-activation-phone></strong></p>
        <div class="bez-kart-activation__code-input" role="group" aria-label="Код из SMS">
            ${Array.from({length: 6}, (_, index) => `<input data-code-digit inputmode="numeric" pattern="[0-9]" maxlength="1" placeholder=" " autocomplete="${index === 0 ? 'one-time-code' : 'off'}" aria-label="Цифра ${index + 1} из 6" required>`).join('')}
        </div>
        <button class="bez-kart-activation__submit" type="submit">Активировать</button>
        <button class="bez-kart-activation__resend" type="button" data-resend-code disabled>Отправить код повторно через <span data-resend-seconds>60</span> сек.</button>
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

function appendCard(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    const card = stage.querySelector<HTMLElement>('.bez-kart-activation__card');
    if (!card) return;
    const level = Number(profile.BonusLevel);
    const cardType = bonus.cardType ?? 'Silver';
    const visual = [
        'card-ag-comp.webp',
        'card-au-comp.webp',
        'card-pt-comp.webp',
    ][Number.isInteger(level) && level >= 1 && level <= 3 ? level - 1 : Math.max(0, ['Silver', 'Gold', 'Platinum'].indexOf(cardType))];
    const image = document.createElement('img');
    image.src = assetUrl(visual);
    image.alt = `Карта CoralBonus ${cardType}`;
    const number = document.createElement('span');
    const digits = (bonus.cardNumber ?? '').replace(/\D/g, '');
    number.textContent = digits.match(/(\d{3})(\d{4})(\d{4})/)?.slice(1).join(' ') ?? '';
    card.append(image, number);
}

export function showSuccessResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${DIALOG_ID}-title">Карта активирована!</h2>
            <p>Ваш уровень — <strong data-card-level></strong>, кешбэк <strong data-card-cashback></strong> с каждой покупки</p>
            <div class="bez-kart-activation__card"></div>
            <a class="bez-kart-activation__submit" href="/">Подобрать тур</a>
        </div>`;
    const level = bonus.cardType ?? 'Silver';
    stage.querySelector<HTMLElement>('[data-card-level]')!.textContent = level;
    stage.querySelector<HTMLElement>('[data-card-cashback]')!.textContent = `${({Silver: 1, Gold: 2, Platinum: 3} as Record<string, number>)[level] ?? 1}%`;
    appendCard(stage, bonus, profile);
}

export function showRefreshRequiredResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('fail-mark.svg')}" alt="">
            <h2 id="${DIALOG_ID}-title">Что-то пошло не так...</h2>
            <p>Пожалуйста, попробуйте обновить страницу</p>
        </div>`;
}

export function showExistingCardResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${DIALOG_ID}-title">У вас уже есть карта CoralBonus</h2>
            <div class="bez-kart-activation__card"></div>
            <p>Бонусы за поездки: <strong data-trip-balance></strong></p>
            <p>Акционные бонусы: <strong data-promo-balance></strong></p>
        </div>`;
    stage.querySelector<HTMLElement>('[data-trip-balance]')!.textContent = String(bonus.accumulatedBalance ?? 0);
    stage.querySelector<HTMLElement>('[data-promo-balance]')!.textContent = String(bonus.promoBalance ?? 0);
    appendCard(stage, bonus, profile);
}
