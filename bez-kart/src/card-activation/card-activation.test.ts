// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {requestCardActivation} from './card-activation';
import {formatBirthdate, getProfile} from './profile';
import {activateCard, normalizePhone, refreshUser, registerCard, sendVerificationCode} from './customer-api';
import {applyConsents} from './consents';

vi.mock('./profile', () => ({
    formatBirthdate: vi.fn(),
    getProfile: vi.fn(),
    waitForLogin: vi.fn(),
}));
vi.mock('./customer-api', () => ({
    activateCard: vi.fn(),
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
    });

    it('показывает форму с данными профиля и первым шагом', async () => {
        await requestCardActivation();

        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation');
        const form = dialog?.querySelector<HTMLFormElement>('form');
        expect(dialog?.getAttribute('aria-label')).toBe('Оформление карты');
        expect(dialog?.querySelector('.bez-kart-activation__steps')?.getAttribute('aria-label')).toBe('Шаг 1 из 3');
        expect((form?.elements.namedItem('givenName') as HTMLInputElement).value).toBe('Анна');
        expect((form?.elements.namedItem('birthDate') as HTMLInputElement).value).toBe('1990-01-02');
    });

    it('показывает существующую карту без формы регистрации', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});

        await requestCardActivation();

        const dialog = document.querySelector('#bez-kart-card-activation');
        expect(dialog?.textContent).toContain('У вас уже есть карта CoralBonus');
        expect(dialog?.querySelector('form')).toBeNull();
    });

    it('проходит от регистрации к SMS и результату', async () => {
        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const form = dialog.querySelector<HTMLFormElement>('form')!;
        fillRequiredFields(form);
        submit(form);

        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());
        expect(registerCard).toHaveBeenCalledOnce();
        expect(applyConsents).toHaveBeenCalledOnce();
        expect(sendVerificationCode).toHaveBeenCalledWith('79990000000');
        expect(dialog.querySelector('[data-step-mark][aria-current="step"]')?.textContent).toBe('2');

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        (verification.elements.namedItem('code') as HTMLInputElement).value = '123456';
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Карта активирована!'));
        expect(activateCard).toHaveBeenCalledWith('79990000000', '123456');
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
