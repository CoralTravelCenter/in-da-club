import {formatBirthdate, type UserProfile} from './profile';

export interface CoralPopupElement extends HTMLElement {
    show: () => Promise<void> | void;
    hide: () => void;
}

const DIALOG_ID = 'bez-kart-card-activation';

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
        <div class="bez-kart-activation__banner" aria-hidden="true"></div>
        <div class="bez-kart-activation__panel">
            <div class="bez-kart-activation__steps" role="group" aria-label="Шаг 1 из 3">
                <span data-step-mark data-state="current" aria-current="step">1</span><i></i>
                <span data-step-mark data-state="upcoming">2</span><i></i>
                <span data-step-mark data-state="upcoming">3</span>
            </div>
            <div class="bez-kart-activation__stage"></div>
        </div>`;

    document.body.append(dialog);
    return dialog;
}

export function createRegistrationForm(profile: UserProfile): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__form';
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
            <label><span>Дата рождения <b>*</b></span><input type="date" name="birthDate" required autocomplete="bday"></label>
        </div>
        <label><span>Город <b>*</b></span><input name="city" required autocomplete="address-level2"></label>
        <label><span>Электронная почта <b>*</b></span><input type="email" name="email" required readonly autocomplete="email"></label>
        <label><span>Телефон <b>*</b></span><input type="tel" name="mobilePhone" required readonly autocomplete="tel"></label>
        <div class="bez-kart-activation__consents">
            <label><input type="checkbox" name="personal" required> <span><b>*</b> Даю согласие на обработку персональных данных. <a href="https://cdn.coral.ru/content/doc/legal/privacy_policy_coral.pdf" target="_blank" rel="noopener">Политика обработки персональных данных</a></span></label>
            <label><input type="checkbox" name="loyalty" required> <span><b>*</b> Ознакомлен и согласен с <a href="https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf" target="_blank" rel="noopener">Правилами Программы лояльности</a></span></label>
            <label><input type="checkbox" name="offers"> <span>Даю согласие на получение новостей, акций и специальных предложений.</span></label>
        </div>
        <button class="bez-kart-activation__submit" type="submit">Получить код по SMS</button>`;

    const setValue = (name: string, value: string): void => {
        const input = form.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = value;
    };
    setValue('familyName', profile.surname ?? '');
    setValue('givenName', profile.name ?? '');
    setValue('birthDate', formatBirthdate(profile.birthdate));
    setValue('email', profile.email ?? '');
    setValue('mobilePhone', profile.mobilePhone ?? '');
    const gender = String(profile.gender ?? '').toUpperCase();
    const genderInput = form.querySelector<HTMLInputElement>(`input[name="gender"][value="${gender === 'F' || gender === '1' ? '1' : '0'}"]`);
    if (genderInput) genderInput.checked = true;

    return form;
}

export function createVerificationForm(mobilePhone: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'bez-kart-activation__verify';
    form.innerHTML = `
        <h2 id="${DIALOG_ID}-title">Введите код из SMS</h2>
        <p>Отправили код активации на номер<br><strong data-activation-phone></strong></p>
        <input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" aria-label="Код из SMS" required>
        <button class="bez-kart-activation__submit" type="submit">Активировать</button>`;
    const phone = form.querySelector<HTMLElement>('[data-activation-phone]');
    if (phone) phone.textContent = mobilePhone;
    return form;
}

export function showSuccessResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <span class="bez-kart-activation__success" aria-hidden="true">✓</span>
            <h2 id="${DIALOG_ID}-title">Карта активирована!</h2>
            <a class="bez-kart-activation__submit" href="/">Подобрать тур</a>
        </div>`;
}

export function showRefreshRequiredResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <h2 id="${DIALOG_ID}-title">Карта активирована!</h2>
            <p>Обновите страницу, чтобы увидеть данные карты.</p>
        </div>`;
}

export function showExistingCardResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <span class="bez-kart-activation__success" aria-hidden="true">✓</span>
            <h2 id="${DIALOG_ID}-title">У вас уже есть карта CoralBonus</h2>
            <a class="bez-kart-activation__submit" href="/account/">Открыть личный кабинет</a>
        </div>`;
}
