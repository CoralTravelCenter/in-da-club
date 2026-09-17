// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {requestCardActivation} from './card-activation';
import {formatBirthdate, getProfile} from './profile';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode} from './customer-api';
import {applyConsents} from './consents';

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
        expect(dialog?.querySelector('.bez-kart-activation__steps')?.getAttribute('aria-label')).toBe('Шаг 1 из 3');
        expect((form?.elements.namedItem('givenName') as HTMLInputElement).value).toBe('Анна');
        expect((form?.elements.namedItem('birthDate') as HTMLInputElement).value).toBe('02 / 01 / 1990');
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
        expect(city.validationMessage).toBe('Укажите город из списка');
    });

    it('не отправляет некорректную дату рождения', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRequiredFields(form);
        const birthDate = form.elements.namedItem('birthDate') as HTMLInputElement;
        birthDate.value = '31 / 02 / 1990';
        submit(form);
        expect(registerCard).not.toHaveBeenCalled();
        expect(birthDate.validationMessage).toBe('Укажите корректную дату рождения');
    });

    it('показывает существующую карту без формы регистрации', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});

        await requestCardActivation();

        const dialog = document.querySelector('#bez-kart-card-activation');
        expect(dialog?.textContent).toContain('У вас уже есть карта CoralBonus');
        expect(dialog?.textContent).toContain('Бонусы за поездки: 100');
        expect(dialog?.textContent).toContain('123 4567 8901');
        expect(dialog?.querySelector<HTMLImageElement>('.bez-kart-activation__card img')?.src).toBe('http://localhost:5173/card-au-comp.webp');
        expect(dialog?.querySelector<HTMLImageElement>('.bez-kart-activation__result-icon')?.src).toBe('http://localhost:5173/success-mark.svg');
        expect(dialog?.querySelector('form')).toBeNull();
    });

    it('показывает ошибку вместо пустого экрана, если профиль карты недоступен', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});
        vi.mocked(getBonusProfile).mockRejectedValueOnce(new Error('Нет ответа'));

        await requestCardActivation();

        const dialog = document.querySelector('#bez-kart-card-activation');
        expect(dialog?.textContent).toContain('Что-то пошло не так');
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
        expect(getBonusProfile).toHaveBeenCalledOnce();
        expect(dialog.textContent).toContain('Ваш уровень — Gold, кешбэк 2%');
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('3');
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
