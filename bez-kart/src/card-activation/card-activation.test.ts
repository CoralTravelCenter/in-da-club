// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {requestCardActivation} from './card-activation';
import {formatBirthdate, getProfile} from './profile';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode} from './customer-api';
import {applyConsents} from './consents';
import {sendBonusAccountActivation, sendBonusAccountRegistration} from './mindbox';

vi.mock('./profile', () => ({
    formatBirthdate: vi.fn(),
    getProfile: vi.fn(),
    waitForLogin: vi.fn(),
}));
vi.mock('./customer-api', () => ({
    activateCard: vi.fn(),
    getBonusProfile: vi.fn(),
    normalizePhone: vi.fn(),
    refreshUser: vi.fn(),
    registerCard: vi.fn(),
    sendVerificationCode: vi.fn(),
}));
vi.mock('./consents', () => ({applyConsents: vi.fn()}));
vi.mock('./mindbox', () => ({
    sendBonusAccountActivation: vi.fn(),
    sendBonusAccountRegistration: vi.fn(),
}));

class TestPopup extends HTMLElement {
    show(): void {}
    hide(): void {}
}

if (!customElements.get('coral-popup')) {
    customElements.define('coral-popup', TestPopup);
}

const profile = {
    name: 'Анна',
    surname: 'Тестова',
    email: 'anna@example.test',
    mobilePhone: '79990000000',
    birthdate: '1990-01-02',
    gender: 'F',
};

function fillRequiredFields(form: HTMLFormElement): void {
    (form.elements.namedItem('city') as HTMLInputElement).value = 'Москва';
    (form.elements.namedItem('personal') as HTMLInputElement).checked = true;
    (form.elements.namedItem('loyalty') as HTMLInputElement).checked = true;
}

function submit(form: HTMLFormElement): void {
    form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
}

describe('card activation markup and flow', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        document.body.replaceChildren();
        vi.mocked(getProfile).mockReturnValue(profile);
        vi.mocked(formatBirthdate).mockReturnValue('1990-01-02');
        vi.mocked(normalizePhone).mockReturnValue('79990000000');
        vi.mocked(registerCard).mockResolvedValue();
        vi.mocked(applyConsents).mockResolvedValue();
        vi.mocked(sendVerificationCode).mockResolvedValue();
        vi.mocked(activateCard).mockResolvedValue();
        vi.mocked(refreshUser).mockResolvedValue(true);
        vi.mocked(getBonusProfile).mockResolvedValue({cardType: 'Gold', cardNumber: '12345678901', accumulatedBalance: 100, promoBalance: 50});
    });

    it('показывает форму с данными профиля и первым шагом', async () => {
        await requestCardActivation();

        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation');
        const form = dialog?.querySelector<HTMLFormElement>('form');
        expect(dialog?.getAttribute('aria-label')).toBe('Оформление карты');
        expect(dialog?.classList.contains('bez-kart-activation')).toBe(true);
        expect(dialog?.querySelector('.bez-kart-activation__body')).toBeTruthy();
        expect(dialog?.querySelector('.bez-kart-activation__panel')).toBeTruthy();
        expect(dialog?.querySelector('.bez-kart-activation__stage')).toBeTruthy();
        expect(dialog?.querySelector('.bez-kart-activation__steps')?.getAttribute('aria-label')).toBe('Шаг 1 из\u00a03');
        expect(form?.classList.contains('bez-kart-activation__form')).toBe(true);
        expect((form?.elements.namedItem('givenName') as HTMLInputElement).value).toBe('Анна');
        expect((form?.elements.namedItem('birthDate') as HTMLInputElement).value).toBe('02 / 01 / 1990');
        expect((form?.elements.namedItem('mobilePhone') as HTMLInputElement).readOnly).toBe(true);
        expect((form?.elements.namedItem('mobilePhone') as HTMLInputElement).value).toBe('+7 (999) 000-00-00');
    });

    it('использует актуальные ссылки на согласия и правила программы', async () => {
        await requestCardActivation();

        const links = [...document.querySelectorAll<HTMLAnchorElement>('.bez-kart-activation__consents a')];

        expect(links.map(({href}) => href)).toEqual([
            'https://b2ccdn.coral.ru/content/doc/cb/soglasie_na_obrabotku_personalynyh_dannyh_coralbonus.pdf',
            'https://b2ccdn.coral.ru/content/doc/cb/politika-obrabotki-persdannyh-coralbonus-24-09-25.pdf',
            'https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf',
            'https://b2ccdn.coral.ru/content/doc/cb/soglasie-na-rassylku-coralbonus-24-09-2025.pdf',
        ]);
        expect(links.every(({target, rel}) => target === '_blank' && rel === 'noopener')).toBe(true);
    });

    it('не позволяет изменить или отправить некорректный телефон из профиля', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, mobilePhone: 'некорректный номер'});
        await requestCardActivation();

        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        const mobilePhone = form.elements.namedItem('mobilePhone') as HTMLInputElement;
        expect(mobilePhone.readOnly).toBe(true);
        expect(mobilePhone.value).toBe('');

        fillRequiredFields(form);
        submit(form);
        expect(registerCard).not.toHaveBeenCalled();
        expect(mobilePhone.getAttribute('aria-invalid')).toBe('true');
        expect(form.textContent).toContain('Укажите телефон');
    });

    it('сохраняет высоту первого шага для следующих экранов', async () => {
        const rect = {x: 0, y: 0, top: 0, right: 0, bottom: 640, left: 0, width: 0, height: 640, toJSON: () => ({})};
        const getRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);

        await requestCardActivation();

        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        expect(dialog.style.getPropertyValue('--bez-kart-activation-step-height')).toBe('640px');
        getRect.mockRestore();
    });

    it('закрывает попап отдельной доступной кнопкой', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<TestPopup>('#bez-kart-card-activation')!;
        const hide = vi.spyOn(dialog, 'hide');
        const show = vi.spyOn(dialog, 'show');
        const control = dialog.querySelector<HTMLElement>('.bez-kart-activation__close')!;
        const close = control.querySelector<HTMLButtonElement>('button')!;

        expect(control.getAttribute('trait')).toBe('pale');
        expect(control.getAttribute('shape')).toBe('pill');
        expect(control.getAttribute('size')).toBe('small');
        expect(close.style.position).toBe('absolute');
        expect(close.style.top).toBe('calc(-39px)');
        expect(close.textContent).toBe('Закрыть');
        close.click();

        expect(hide).toHaveBeenCalledOnce();

        await requestCardActivation();

        expect(show).toHaveBeenCalledOnce();
        expect(document.querySelectorAll('#bez-kart-card-activation')).toHaveLength(1);
        expect(document.querySelector('#bez-kart-card-activation')).toBe(dialog);
    });

    it('не создаёт второй попап при повторном запросе активации', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<TestPopup>('#bez-kart-card-activation')!;
        const show = vi.spyOn(dialog, 'show');

        await requestCardActivation();

        expect(show).toHaveBeenCalledOnce();
        expect(document.querySelectorAll('#bez-kart-card-activation')).toHaveLength(1);
        expect(document.querySelector('#bez-kart-card-activation')).toBe(dialog);
    });

    it('удаляет неоткрывшийся попап и позволяет повторить попытку', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const show = vi.spyOn(TestPopup.prototype, 'show').mockRejectedValueOnce(new Error('Popup failed'));

        await requestCardActivation();

        expect(document.querySelector('#bez-kart-card-activation')).toBeNull();

        await requestCardActivation();

        expect(document.querySelector('#bez-kart-card-activation')).not.toBeNull();
        expect(show).toHaveBeenCalledTimes(2);
        consoleError.mockRestore();
        show.mockRestore();
    });

    it('предлагает города из исходного списка и не отправляет неизвестный город', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        const city = form.elements.namedItem('city') as HTMLInputElement;
        city.value = 'Мос';
        city.dispatchEvent(new Event('input', {bubbles: true}));
        expect(form.querySelector('.bez-kart-activation__city-options')?.textContent).toContain('Москва');
        form.querySelector<HTMLButtonElement>('.bez-kart-activation__city-options button')?.click();
        expect(city.value).toBe('Москва');

        fillRequiredFields(form);
        city.value = 'Несуществующий город';
        submit(form);
        expect(registerCard).not.toHaveBeenCalled();
        expect(city.getAttribute('aria-invalid')).toBe('true');
        expect(form.textContent).toContain('Укажите город из\u00a0списка');
    });

    it('перемещает фокус по вариантам городов стрелками', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        const city = form.elements.namedItem('city') as HTMLInputElement;
        city.value = 'М';
        city.dispatchEvent(new Event('input', {bubbles: true}));

        const options = [...form.querySelectorAll<HTMLButtonElement>('.bez-kart-activation__city-options button')];
        city.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
        expect(document.activeElement).toBe(options[0]);

        options[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
        expect(document.activeElement).toBe(options[1]);

        options[1].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
        expect(document.activeElement).toBe(options[0]);

        options[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
        expect(document.activeElement).toBe(city);
    });

    it('не отправляет некорректную дату рождения', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        const birthDate = form.elements.namedItem('birthDate') as HTMLInputElement;
        birthDate.value = '31 / 02 / 1990';
        submit(form);
        expect(registerCard).not.toHaveBeenCalled();
        expect(birthDate.getAttribute('aria-invalid')).toBe('true');
        expect(form.textContent).toContain('Укажите корректную дату рождения');
    });

    it('показывает собственные сообщения для незаполненных обязательных полей', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        (form.elements.namedItem('familyName') as HTMLInputElement).value = '';
        submit(form);

        expect(registerCard).not.toHaveBeenCalled();
        expect(form.noValidate).toBe(true);
        expect(form.textContent).toContain('Укажите фамилию');
        expect(form.textContent).toContain('Укажите город');
        expect(form.textContent).toContain('Подтвердите согласие на\u00a0обработку персональных данных');
    });

    it('убирает ошибку поля сразу после его заполнения', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        const familyName = form.elements.namedItem('familyName') as HTMLInputElement;
        const personal = form.elements.namedItem('personal') as HTMLInputElement;
        familyName.value = '';
        submit(form);

        expect(familyName.getAttribute('aria-invalid')).toBe('true');
        expect(personal.getAttribute('aria-invalid')).toBe('true');

        familyName.value = 'Тестова';
        familyName.dispatchEvent(new Event('input', {bubbles: true}));
        personal.checked = true;
        personal.dispatchEvent(new Event('change', {bubbles: true}));

        expect(familyName.hasAttribute('aria-invalid')).toBe(false);
        expect(personal.hasAttribute('aria-invalid')).toBe(false);
        expect(form.textContent).not.toContain('Укажите фамилию');
        expect(form.textContent).not.toContain('Подтвердите согласие на\u00a0обработку персональных данных');
    });

    it('показывает существующую карту без формы регистрации', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});

        await requestCardActivation();

        const dialog = document.querySelector('#bez-kart-card-activation');
        expect(dialog?.textContent).toContain('У\u00a0вас уже есть карта CoralBonus');
        expect(dialog?.textContent).toContain('Бонусы за\u00a0поездки: 100');
        expect(dialog?.textContent).toContain('123 4567 8901');
        expect(dialog?.querySelector<HTMLImageElement>('.bez-kart-activation__card img')?.src).toBe('http://localhost:5173/card-au-comp.webp');
        expect(dialog?.querySelector<HTMLImageElement>('.bez-kart-activation__result-icon')?.src).toBe('http://localhost:5173/success-mark.svg');
        expect(dialog?.querySelector('.bez-kart-activation__body')?.classList.contains('bez-kart-activation__body--single')).toBe(true);
        expect(dialog?.querySelector('form')).toBeNull();
    });

    it('показывает ошибку вместо пустого экрана, если профиль карты недоступен', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});
        vi.mocked(getBonusProfile).mockRejectedValueOnce(new Error('Нет ответа'));

        await requestCardActivation();

        const dialog = document.querySelector('#bez-kart-card-activation');
        expect(dialog?.textContent).toContain('Что-то пошло не\u00a0так');
        expect(dialog?.textContent).toContain('обновить страницу');
    });

    it('проходит от регистрации к SMS и результату', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());
        expect(registerCard).toHaveBeenCalledOnce();
        expect(registerCard).toHaveBeenCalledWith(expect.objectContaining({birthDate: '1990-01-02', city: 'Москва'}));
        expect(sendBonusAccountRegistration).toHaveBeenCalledWith('Москва', undefined);
        expect(applyConsents).toHaveBeenCalledOnce();
        expect(sendVerificationCode).toHaveBeenCalledWith('79990000000');
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('2');

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        const paste = new Event('paste', {bubbles: true, cancelable: true});
        Object.defineProperty(paste, 'clipboardData', {value: {getData: () => '123456'}});
        verification.querySelector<HTMLInputElement>('[data-code-digit]')?.dispatchEvent(paste);
        expect([...verification.querySelectorAll<HTMLInputElement>('[data-code-digit]')].map((input) => input.value)).toEqual(['1', '2', '3', '4', '5', '6']);
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Карта активирована!'));
        expect(activateCard).toHaveBeenCalledWith('79990000000', '123456');
        expect(sendBonusAccountActivation).toHaveBeenCalledWith('Москва', 'Gold', '12345678901');
        expect(vi.mocked(getBonusProfile).mock.invocationCallOrder[0])
            .toBeLessThan(vi.mocked(sendBonusAccountActivation).mock.invocationCallOrder[0]);
        expect(getBonusProfile).toHaveBeenCalledOnce();
        expect(dialog.querySelector('.bez-kart-activation__result')).toBeTruthy();
        expect(dialog.querySelector('.bez-kart-activation__card')).toBeTruthy();
        expect(dialog.textContent).toContain('Ваш уровень\u00a0— Gold, кешбэк 2%');
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('3');
    });

    it('показывает активацию на кнопке до перехода к результату', async () => {
        let resolveRefresh!: (value: boolean) => void;
        vi.mocked(refreshUser).mockImplementationOnce(() => new Promise<boolean>((resolve) => { resolveRefresh = resolve; }));
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(registration);
        submit(registration);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        verification.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => { input.value = '1'; });
        submit(verification);

        await vi.waitFor(() => expect(refreshUser).toHaveBeenCalledOnce());
        expect(verification.dataset.state).toBe('activating');
        expect(verification.getAttribute('aria-busy')).toBe('true');
        expect(verification.querySelector<HTMLButtonElement>('.bez-kart-activation__submit')?.textContent).toBe('Активируем карту…');
        expect(dialog.textContent).not.toContain('Проверяем…');
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('2');
        expect(sendBonusAccountActivation).not.toHaveBeenCalled();

        resolveRefresh(true);
        await vi.waitFor(() => expect(dialog.textContent).toContain('Карта активирована!'));
        expect(sendBonusAccountActivation).toHaveBeenCalledOnce();
    });

    it('не отправляет активацию в Mindbox, если RefreshLogin не обновил профиль', async () => {
        vi.mocked(refreshUser).mockResolvedValueOnce(false);
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(registration);
        submit(registration);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        verification.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => { input.value = '1'; });
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Что-то пошло не\u00a0так'));
        expect(dialog.getAttribute('aria-label')).toBe('Не\u00a0удалось обновить данные карты');
        expect(getBonusProfile).not.toHaveBeenCalled();
        expect(sendBonusAccountActivation).not.toHaveBeenCalled();
    });

    it('не отправляет активацию в Mindbox, если BonusProfile завершился ошибкой', async () => {
        vi.mocked(getBonusProfile).mockRejectedValueOnce(new Error('Нет ответа'));
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(registration);
        submit(registration);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        verification.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => { input.value = '1'; });
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Что-то пошло не\u00a0так'));
        expect(dialog.getAttribute('aria-label')).toBe('Не\u00a0удалось обновить данные карты');
        expect(sendBonusAccountActivation).not.toHaveBeenCalled();
    });

    it('при ошибке SMS оставляет форму и показывает сообщение', async () => {
        vi.mocked(sendVerificationCode).mockRejectedValueOnce(new Error('Сервис SMS недоступен'));
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(dialog.querySelector('[role="alert"]')?.textContent).toBe('Сервис SMS недоступен'));
        expect(dialog.querySelector('.bez-kart-activation__form')).toBeTruthy();
        expect(dialog.querySelector<HTMLButtonElement>('.bez-kart-activation__submit')?.textContent).toBe('Получить код по\u00a0SMS');
        expect(dialog.querySelector<HTMLButtonElement>('.bez-kart-activation__submit')?.disabled).toBe(false);
    });

    it('не отправляет регистрацию в Mindbox при ошибке BonusRegister', async () => {
        vi.mocked(registerCard).mockRejectedValueOnce(new Error('Отказ регистрации'));
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(form.querySelector('[role="alert"]')?.textContent).toBe('Отказ регистрации'));
        expect(sendBonusAccountRegistration).not.toHaveBeenCalled();
    });

    it('не отправляет активацию в Mindbox при ошибке BonusActivation', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(registration);
        submit(registration);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        vi.mocked(activateCard).mockRejectedValueOnce(new Error('Неверный код'));
        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        verification.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => { input.value = '1'; });
        submit(verification);

        await vi.waitFor(() => expect(verification.querySelector('[role="alert"]')?.textContent).toBe('Неверный код'));
        expect(sendBonusAccountActivation).not.toHaveBeenCalled();
    });

    it('показывает отправку кода состоянием основной кнопки', async () => {
        let resolveSms!: () => void;
        vi.mocked(sendVerificationCode).mockImplementationOnce(() => new Promise<void>((resolve) => { resolveSms = resolve; }));
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(form.querySelector<HTMLButtonElement>('.bez-kart-activation__submit')?.textContent).toBe('Отправляем\u00a0код…'));
        await vi.waitFor(() => expect(sendVerificationCode).toHaveBeenCalledOnce());
        expect(form.getAttribute('aria-busy')).toBe('true');
        expect(form.dataset.state).toBe('sending');
        expect(form.querySelector<HTMLButtonElement>('.bez-kart-activation__submit')?.disabled).toBe(true);
        expect(dialog.querySelector('.bez-kart-activation__status')).toBeNull();

        resolveSms();
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());
    });

    it('не позволяет вернуться к форме через степпер с шага SMS', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        submit(form);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        expect(dialog.querySelectorAll('button[data-step-mark]')).toHaveLength(0);
        expect(dialog.querySelector('.bez-kart-activation__form')).toBeNull();
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('2');
    });

    it('разрешает повторно отправить SMS после таймера', async () => {
        vi.useFakeTimers();
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        submit(form);
        await vi.advanceTimersByTimeAsync(0);
        const resend = dialog.querySelector<HTMLButtonElement>('[data-resend-code]')!;
        expect(resend.disabled).toBe(true);
        expect(resend.querySelector('[data-resend-seconds]')?.textContent).toBe('01:00');

        await vi.advanceTimersByTimeAsync(1_000);
        expect(resend.querySelector('[data-resend-seconds]')?.textContent).toBe('00:59');

        await vi.advanceTimersByTimeAsync(59_000);
        expect(resend.disabled).toBe(false);
        let resolveResend!: () => void;
        vi.mocked(sendVerificationCode).mockImplementationOnce(() => new Promise<void>((resolve) => { resolveResend = resolve; }));
        resend.click();
        await vi.advanceTimersByTimeAsync(0);

        expect(sendVerificationCode).toHaveBeenCalledTimes(2);
        expect(resend.textContent).toBe('Отправляем\u00a0код…');
        expect(resend.dataset.state).toBe('sending');
        expect(resend.getAttribute('aria-busy')).toBe('true');
        resolveResend();
        await vi.advanceTimersByTimeAsync(0);
        expect(resend.dataset.state).toBe('cooldown');
        vi.useRealTimers();
    });

    it('после ошибки согласий повторяет попытку без повторной регистрации', async () => {
        vi.mocked(applyConsents).mockRejectedValueOnce(new Error('Ошибка согласий'));
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(dialog.querySelector('[role="alert"]')?.textContent).toBe('Ошибка согласий'));
        submit(form);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());
        expect(registerCard).toHaveBeenCalledOnce();
        expect(applyConsents).toHaveBeenCalledTimes(2);
    });
});
