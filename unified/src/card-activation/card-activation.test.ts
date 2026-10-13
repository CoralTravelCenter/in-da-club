// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {requestCardActivation} from './card-activation';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode} from './api/customer-api';
import {sendBonusAccountActivation, sendBonusAccountRegistration} from './api/mindbox';
import {formatBirthdate, getProfile} from './model/profile';

vi.mock('./model/profile', () => ({
    formatBirthdate: vi.fn(),
    getProfile: vi.fn(),
    waitForLogin: vi.fn(),
}));
vi.mock('./api/customer-api', () => ({
    activateCard: vi.fn(),
    getBonusProfile: vi.fn(),
    normalizePhone: vi.fn(),
    refreshUser: vi.fn(),
    registerCard: vi.fn(),
    sendVerificationCode: vi.fn(),
}));
vi.mock('./api/mindbox', () => ({
    sendBonusAccountActivation: vi.fn(),
    sendBonusAccountRegistration: vi.fn(),
}));

class TestPopup extends HTMLElement {
    show(): void {}
    hide(): void {}
}

if (!customElements.get('coral-popup')) customElements.define('coral-popup', TestPopup);

const profile = {
    name: 'Анна',
    surname: 'Тестова',
    email: 'anna@example.test',
    mobilePhone: '79990000000',
    birthdate: '1990-01-02',
    gender: 'F',
    nameId: 42,
};

function fillRequiredFields(form: HTMLFormElement): void {
    (form.elements.namedItem('city') as HTMLInputElement).value = 'Москва';
    (form.elements.namedItem('personal') as HTMLInputElement).checked = true;
    (form.elements.namedItem('loyalty') as HTMLInputElement).checked = true;
}

function submit(form: HTMLFormElement): void {
    form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
}

describe('card activation business flow', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        document.body.replaceChildren();
        vi.mocked(getProfile).mockReturnValue(profile);
        vi.mocked(formatBirthdate).mockReturnValue('1990-01-02');
        vi.mocked(normalizePhone).mockReturnValue('79990000000');
        vi.mocked(registerCard).mockResolvedValue();
        vi.mocked(sendVerificationCode).mockResolvedValue();
        vi.mocked(activateCard).mockResolvedValue();
        vi.mocked(refreshUser).mockResolvedValue(true);
        vi.mocked(getBonusProfile).mockResolvedValue({
            cardType: 'Gold',
            cardNumber: '12345678901',
            accumulatedBalance: 100,
            promoBalance: 50,
        });
        window.history.replaceState({}, '', '/club');
    });

    it('не отправляет регистрацию с некорректным телефоном профиля', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, mobilePhone: 'некорректный номер'});
        vi.mocked(normalizePhone).mockReturnValue('');
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.in-da-club-activation__form')!;

        fillRequiredFields(form);
        submit(form);

        expect(registerCard).not.toHaveBeenCalled();
        expect((form.elements.namedItem('mobilePhone') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
    });

    it('не отправляет регистрацию с неизвестным городом', async () => {
        await requestCardActivation();
        const form = document.querySelector<HTMLFormElement>('.in-da-club-activation__form')!;

        fillRequiredFields(form);
        (form.elements.namedItem('city') as HTMLInputElement).value = 'Несуществующий город';
        submit(form);

        expect(registerCard).not.toHaveBeenCalled();
    });

    it('загружает данные существующей карты без повторной регистрации', async () => {
        vi.mocked(getProfile).mockReturnValue({...profile, BonusUserId: 42});

        await requestCardActivation();

        expect(getBonusProfile).toHaveBeenCalledOnce();
        expect(registerCard).not.toHaveBeenCalled();
        expect(document.querySelector('#in-da-club-activation')?.textContent).toContain('123 4567 8901');
    });

    it('проходит регистрацию, подтверждение SMS и активацию карты', async () => {
        await requestCardActivation('TEST_PROMO');
        const dialog = document.querySelector<HTMLElement>('#in-da-club-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('form')!;
        fillRequiredFields(registration);
        submit(registration);

        await vi.waitFor(() => expect(dialog.querySelector('.in-da-club-activation__verify')).toBeTruthy());
        expect(registerCard).toHaveBeenCalledWith(expect.objectContaining({
            city: 'Москва',
            Promo: 'TEST_PROMO',
            FromPageUrl: '/club',
        }));
        expect(sendBonusAccountRegistration).toHaveBeenCalledWith('Москва', 42);
        expect(sendVerificationCode).toHaveBeenCalledWith('79990000000');

        const verification = dialog.querySelector<HTMLFormElement>('.in-da-club-activation__verify')!;
        verification.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => { input.value = '1'; });
        submit(verification);

        await vi.waitFor(() => expect(sendBonusAccountActivation).toHaveBeenCalledOnce());
        expect(activateCard).toHaveBeenCalledWith('79990000000', '111111');
        expect(sendBonusAccountActivation).toHaveBeenCalledWith('Москва', 'Gold', '12345678901', 42);
    });
});
