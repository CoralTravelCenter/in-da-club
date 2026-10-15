import {cities} from '../model/cities';
import type {UserProfile} from '@/customer/profile-storage';
import {displayBirthdate, displayPhone, isKnownCity, isValidPhone, parseBirthdate} from '../model/registration';
import {ACTIVATION_DIALOG_ID} from './activation-view';
import {content} from '@/content/content';
import {textToSafeHtml} from '@/shared/runtime/text';

function clearValidationErrors(form: HTMLFormElement): void {
    form.querySelectorAll('.in-da-club-activation__field-error').forEach((error) => error.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
}

function showFieldError(field: HTMLInputElement, message: string): void {
    if (field.getAttribute('aria-invalid') === 'true') return;
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'in-da-club-activation__field-error';
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
    container?.querySelector('.in-da-club-activation__field-error')?.remove();
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
        [form.elements.namedItem('familyName') as HTMLInputElement, content.activation.validation.surnameRequired],
        [form.elements.namedItem('givenName') as HTMLInputElement, content.activation.validation.nameRequired],
        [form.querySelector<HTMLInputElement>('input[name="gender"]:checked'), content.activation.validation.genderRequired],
        [birthDate, content.activation.validation.birthdateRequired],
        [city, content.activation.validation.cityRequired],
        [form.elements.namedItem('email') as HTMLInputElement, content.activation.validation.emailRequired],
        [form.elements.namedItem('mobilePhone') as HTMLInputElement, content.activation.validation.phoneRequired],
        [form.elements.namedItem('personal') as HTMLInputElement, content.activation.validation.personalConsentRequired],
        [form.elements.namedItem('loyalty') as HTMLInputElement, content.activation.validation.loyaltyConsentRequired],
    ];
    for (const [field, message] of fields) {
        if (!field || (field.type === 'checkbox' ? !field.checked : !field.value.trim())) {
            const target = field ?? form.querySelector<HTMLInputElement>('input[name="gender"]');
            if (target) showFieldError(target, message);
        }
    }
    if (birthDate.value && !parseBirthdate(birthDate.value)) showFieldError(birthDate, content.activation.validation.birthdateInvalid);
    if (city.value && !isKnownCity(city.value)) showFieldError(city, content.activation.validation.cityInvalid);
    const email = form.elements.namedItem('email') as HTMLInputElement;
    if (email.value && !email.validity.valid) showFieldError(email, content.activation.validation.emailInvalid);
    const mobilePhone = form.elements.namedItem('mobilePhone') as HTMLInputElement;
    if (mobilePhone.value && !isValidPhone(mobilePhone.value)) showFieldError(mobilePhone, content.activation.validation.phoneInvalid);
    const firstInvalid = form.querySelector<HTMLInputElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
    return !firstInvalid;
}

function wireCitySuggestions(form: HTMLFormElement): void {
    const input = form.elements.namedItem('city') as HTMLInputElement;
    const list = form.querySelector<HTMLUListElement>('.in-da-club-activation__city-options')!;
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
    form.className = 'in-da-club-activation__form';
    form.noValidate = true;
    form.innerHTML = `
        <h2 id="${ACTIVATION_DIALOG_ID}-title">${textToSafeHtml(content.activation.registration.title)}</h2>
        <label><span>${textToSafeHtml(content.activation.registration.surname)} <b>*</b></span><input name="familyName" required autocomplete="family-name"></label>
        <label><span>${textToSafeHtml(content.activation.registration.name)} <b>*</b></span><input name="givenName" required autocomplete="given-name"></label>
        <div class="in-da-club-activation__row"><fieldset><legend>${textToSafeHtml(content.activation.registration.gender)} <b>*</b></legend><div class="in-da-club-activation__gender-options"><label><input type="radio" name="gender" value="0" required><span>${textToSafeHtml(content.activation.registration.genderMale)}</span></label><label><input type="radio" name="gender" value="1"><span>${textToSafeHtml(content.activation.registration.genderFemale)}</span></label></div></fieldset><label><span>${textToSafeHtml(content.activation.registration.birthdate)} <b>*</b></span><input name="birthDate" required inputmode="numeric" placeholder="${textToSafeHtml(content.activation.registration.birthdatePlaceholder)}" autocomplete="bday"></label></div>
        <div class="in-da-club-activation__city"><label for="in-da-club-city"><span>${textToSafeHtml(content.activation.registration.city)} <b>*</b></span></label><input id="in-da-club-city" name="city" required autocomplete="address-level2" aria-autocomplete="list" aria-controls="in-da-club-city-options" aria-expanded="false"><ul id="in-da-club-city-options" class="in-da-club-activation__city-options" role="listbox" hidden></ul></div>
        <label><span>${textToSafeHtml(content.activation.registration.email)} <b>*</b></span><input type="email" name="email" required readonly autocomplete="email"></label>
        <label><span>${textToSafeHtml(content.activation.registration.phone)} <b>*</b></span><input type="tel" name="mobilePhone" required readonly inputmode="tel" autocomplete="tel"></label>
        <div class="in-da-club-activation__consents">
            <label><input class="visually-hidden" type="checkbox" name="personal" required><span class="in-da-club-activation__checkbox" aria-hidden="true"></span><span><b>*</b> <a href="${textToSafeHtml(content.activation.links.personalConsent)}" target="_blank" rel="noopener">${textToSafeHtml(content.activation.registration.personalConsent)}</a> <a href="${textToSafeHtml(content.activation.links.personalPolicy)}" target="_blank" rel="noopener">${textToSafeHtml(content.activation.registration.personalPolicy)}</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="loyalty" required><span class="in-da-club-activation__checkbox" aria-hidden="true"></span><span><b>*</b> ${textToSafeHtml(content.activation.registration.loyaltyConsentPrefix)} <a href="${textToSafeHtml(content.activation.links.loyaltyRules)}" target="_blank" rel="noopener">${textToSafeHtml(content.activation.registration.loyaltyRules)}</a></span></label>
            <label><input class="visually-hidden" type="checkbox" name="offers"><span class="in-da-club-activation__checkbox" aria-hidden="true"></span><span><a href="${textToSafeHtml(content.activation.links.offersConsent)}" target="_blank" rel="noopener">${textToSafeHtml(content.activation.registration.offersConsent)}</a></span></label>
        </div>
        <button class="in-da-club-activation__submit" type="submit">${textToSafeHtml(content.activation.registration.submit)}</button>`;
    const setValue = (name: string, value: string): void => {
        const input = form.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = value;
    };
    setValue('familyName', profile.surname ?? '');
    setValue('givenName', profile.name ?? '');
    setValue('birthDate', displayBirthdate(profile.birthdate));
    setValue('email', profile.email ?? '');
    setValue('mobilePhone', displayPhone(profile.mobilePhone));
    const gender = String(profile.gender ?? '').toUpperCase();
    const genderInput = form.querySelector<HTMLInputElement>(`input[name="gender"][value="${gender === 'F' || gender === '1' ? '1' : '0'}"]`);
    if (genderInput) genderInput.checked = true;
    wireCitySuggestions(form);
    wireBirthdateMask(form);
    wireValidationReset(form);
    return form;
}
