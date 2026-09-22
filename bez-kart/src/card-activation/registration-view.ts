import {formatBirthdate, type UserProfile} from './profile';
import {cities} from './cities';
import {ACTIVATION_DIALOG_ID} from './activation-view';
import {typographed} from '../../../shared/typography';

const knownCities = new Set<string>(cities);

function isValidPhone(value: string): boolean {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8')));
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
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null;
    return `${year}-${month}-${day}`;
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
        field.form?.querySelectorAll<HTMLInputElement>(`input[name="${field.name}"]`).forEach((radio) => radio.removeAttribute('aria-invalid'));
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

export function validateRegistrationForm(form: HTMLFormElement): boolean {
    clearValidationErrors(form);
    const city = form.elements.namedItem('city') as HTMLInputElement;
    const birthDate = form.elements.namedItem('birthDate') as HTMLInputElement;
    const fields: Array<[HTMLInputElement | null, string]> = [
        [form.elements.namedItem('familyName') as HTMLInputElement, typographed`Укажите фамилию`],
        [form.elements.namedItem('givenName') as HTMLInputElement, typographed`Укажите имя`],
        [form.querySelector<HTMLInputElement>('input[name="gender"]:checked'), typographed`Выберите пол`],
        [birthDate, typographed`Укажите дату рождения`],
        [city, typographed`Укажите город`],
        [form.elements.namedItem('email') as HTMLInputElement, typographed`Укажите электронную почту`],
        [form.elements.namedItem('mobilePhone') as HTMLInputElement, typographed`Укажите телефон`],
        [form.elements.namedItem('personal') as HTMLInputElement, typographed`Подтвердите согласие на обработку персональных данных`],
        [form.elements.namedItem('loyalty') as HTMLInputElement, typographed`Подтвердите согласие с правилами программы`],
    ];
    for (const [field, message] of fields) {
        if (!field || (field.type === 'checkbox' ? !field.checked : !field.value.trim())) {
            const target = field ?? form.querySelector<HTMLInputElement>('input[name="gender"]');
            if (target) showFieldError(target, message);
        }
    }
    if (birthDate.value && !parseBirthdate(birthDate.value)) showFieldError(birthDate, typographed`Укажите корректную дату рождения`);
    if (city.value && !knownCities.has(city.value.trim())) showFieldError(city, typographed`Укажите город из списка`);
    const email = form.elements.namedItem('email') as HTMLInputElement;
    if (email.value && !email.validity.valid) showFieldError(email, typographed`Укажите корректную электронную почту`);
    const mobilePhone = form.elements.namedItem('mobilePhone') as HTMLInputElement;
    if (mobilePhone.value && !isValidPhone(mobilePhone.value)) showFieldError(mobilePhone, typographed`Укажите корректный номер телефона`);
    const firstInvalid = form.querySelector<HTMLInputElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
    return !firstInvalid;
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
        const matches = query ? cities.filter((name) => name.split(/[\s-]/).some((part) => part.toUpperCase().startsWith(query))).slice(0, 5) : [];
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
        const nextIndex = event.key === 'ArrowDown' ? Math.min(currentIndex + 1, buttons.length - 1) : currentIndex - 1;
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

export function createRegistrationForm(profile: UserProfile): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__form';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${ACTIVATION_DIALOG_ID}-title">${typographed`Оформление карты`}</h2>
        <label><span>${typographed`Фамилия`} <b>*</b></span><input name="familyName" required autocomplete="family-name"></label>
        <label><span>${typographed`Имя`} <b>*</b></span><input name="givenName" required autocomplete="given-name"></label>
        <div class="bez-kart-activation__row"><fieldset><legend>${typographed`Пол`} <b>*</b></legend><div class="bez-kart-activation__gender-options"><label><input type="radio" name="gender" value="0" required><span>М</span></label><label><input type="radio" name="gender" value="1"><span>Ж</span></label></div></fieldset><label><span>${typographed`Дата рождения`} <b>*</b></span><input name="birthDate" required inputmode="numeric" placeholder="ДД / ММ / ГГГГ" autocomplete="bday"></label></div>
        <div class="bez-kart-activation__city"><label for="bez-kart-city"><span>${typographed`Город`} <b>*</b></span></label><input id="bez-kart-city" name="city" required autocomplete="address-level2" aria-autocomplete="list" aria-controls="bez-kart-city-options" aria-expanded="false"><ul id="bez-kart-city-options" class="bez-kart-activation__city-options" role="listbox" hidden></ul></div>
        <label><span>${typographed`Электронная почта`} <b>*</b></span><input type="email" name="email" required readonly autocomplete="email"></label>
        <label><span>${typographed`Телефон`} <b>*</b></span><input type="tel" name="mobilePhone" required readonly inputmode="tel" autocomplete="tel"></label>
        <div class="bez-kart-activation__consents">
            <label><input class="visually-hidden" type="checkbox" name="personal" required><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span><b>*</b> <a href="https://b2ccdn.coral.ru/content/doc/cb/soglasie_na_obrabotku_personalynyh_dannyh_coralbonus.pdf" target="_blank" rel="noopener">${typographed`Даю согласие на обработку персональных данных.`}</a> <a href="https://b2ccdn.coral.ru/content/doc/cb/politika-obrabotki-persdannyh-coralbonus-24-09-25.pdf" target="_blank" rel="noopener">${typographed`Политика обработки персональных данных`}</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="loyalty" required><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span><b>*</b> ${typographed`Ознакомлен и согласен с`} <a href="https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf" target="_blank" rel="noopener">${typographed`Правилами Программы лояльности`}</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="offers"><span class="bez-kart-activation__checkbox" aria-hidden="true"></span><span><a href="https://b2ccdn.coral.ru/content/doc/cb/soglasie-na-rassylku-coralbonus-24-09-2025.pdf" target="_blank" rel="noopener">${typographed`Даю согласие на получение новостей, акций, специальных предложений, в том числе по турам.`}</a></span></label>
        </div>
        <button class="bez-kart-activation__submit" type="submit">${typographed`Получить код по SMS`}</button>`;
    const setValue = (name: string, value: string): void => {
        const input = form.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = value;
    };
    setValue('familyName', profile.surname ?? '');
    setValue('givenName', profile.name ?? '');
    setValue('birthDate', displayBirthdate(profile.birthdate));
    setValue('email', profile.email ?? '');
    const mobilePhone = form.elements.namedItem('mobilePhone') as HTMLInputElement;
    const profilePhone = profile.mobilePhone ?? '';
    if (isValidPhone(profilePhone)) {
        mobilePhone.value = profilePhone;
    } else {
        mobilePhone.readOnly = false;
        mobilePhone.placeholder = '+7 (___) ___-__-__';
    }
    const gender = String(profile.gender ?? '').toUpperCase();
    const genderInput = form.querySelector<HTMLInputElement>(`input[name="gender"][value="${gender === 'F' || gender === '1' ? '1' : '0'}"]`);
    if (genderInput) genderInput.checked = true;
    wireCitySuggestions(form);
    wireBirthdateMask(form);
    wireValidationReset(form);
    return form;
}
