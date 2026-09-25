// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {requestCardActivation} from './card-activation';
import {applyConsents} from './consents';

vi.mock('./consents', () => ({applyConsents: vi.fn()}));

class TestPopup extends HTMLElement {
    show(): void {}
    hide(): void {}
}

if (!customElements.get('coral-popup')) {
    customElements.define('coral-popup', TestPopup);
}

const initialProfile = {
    name: 'Анна',
    surname: 'Тестова',
    email: 'anna@example.test',
    mobilePhone: '79990000000',
    birthdate: '1990-01-02',
    gender: 'F',
    nameId: 42,
};

function response(body: unknown): Response {
    return {ok: true, json: async () => body} as Response;
}

function submit(form: HTMLFormElement): void {
    form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
}

function fillRegistration(form: HTMLFormElement): void {
    (form.elements.namedItem('city') as HTMLInputElement).value = 'Москва';
    (form.elements.namedItem('personal') as HTMLInputElement).checked = true;
    (form.elements.namedItem('loyalty') as HTMLInputElement).checked = true;
}

function fillVerification(form: HTMLFormElement): void {
    form.querySelectorAll<HTMLInputElement>('[data-code-digit]').forEach((input) => {
        input.value = '1';
    });
}

describe('card activation request sequence', () => {
    const trace: string[] = [];
    const mindbox = vi.fn((_method: 'async', payload: {operation: string}) => {
        trace.push(`Mindbox:${payload.operation}`);
    });

    beforeEach(() => {
        trace.length = 0;
        document.body.replaceChildren();
        window.localStorage.clear();
        window.localStorage.setItem('user', JSON.stringify(initialProfile));
        Object.assign(window, {mindbox});
        mindbox.mockClear();
        vi.mocked(applyConsents).mockReset().mockImplementation(async () => {
            trace.push('Consents');
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Reflect.deleteProperty(window, 'mindbox');
    });

    it('выполняет Customer API и Mindbox в согласованном порядке', async () => {
        const jwtPayload = btoa(JSON.stringify({BonusUserId: 84, BonusLevel: 2}));
        const fetchMock = vi.fn(async (url: string) => {
            const path = new URL(url, location.origin).pathname;
            trace.push(path);
            switch (path) {
                case '/endpoints/Customer/BonusRegister':
                case '/endpoints/Customer/BonusSendVerificationCode':
                case '/endpoints/Customer/BonusActivation':
                    return response({result: {isSuccess: true}});
                case '/endpoints/Customer/RefreshLogin':
                    return response({result: {token: `header.${jwtPayload}.signature`}});
                case '/endpoints/Customer/BonusProfile':
                    return response({result: {cardType: 'Gold', cardNumber: '12345678901'}});
                default:
                    throw new Error(`Unexpected request: ${url}`);
            }
        });
        vi.stubGlobal('fetch', fetchMock);

        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRegistration(registration);
        submit(registration);

        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());
        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        fillVerification(verification);
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Карта активирована!'));
        const stored = JSON.parse(window.localStorage.getItem('user') ?? '{}') as Record<string, unknown>;
        expect(stored.BonusUserId).toBe(84);
        expect(trace).toEqual([
            '/endpoints/Customer/BonusRegister',
            'Mindbox:Website.BonusAccountRegistration',
            'Consents',
            '/endpoints/Customer/BonusSendVerificationCode',
            '/endpoints/Customer/BonusActivation',
            '/endpoints/Customer/RefreshLogin',
            '/endpoints/Customer/BonusProfile',
            'Mindbox:Website.BonusAccountActivation',
        ]);
    });

    it('не запрашивает BonusProfile и не отправляет Mindbox Activation без BonusUserId', async () => {
        const jwtPayload = btoa(JSON.stringify({BonusLevel: 2}));
        const fetchMock = vi.fn(async (url: string) => {
            const path = new URL(url, location.origin).pathname;
            trace.push(path);
            if (path === '/endpoints/Customer/RefreshLogin') {
                return response({result: {token: `header.${jwtPayload}.signature`}});
            }
            return response({result: {isSuccess: true}});
        });
        vi.stubGlobal('fetch', fetchMock);

        await requestCardActivation();
        const dialog = document.querySelector<HTMLElement>('#bez-kart-card-activation')!;
        const registration = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__form')!;
        fillRegistration(registration);
        submit(registration);
        await vi.waitFor(() => expect(dialog.querySelector('.bez-kart-activation__verify')).toBeTruthy());

        const verification = dialog.querySelector<HTMLFormElement>('.bez-kart-activation__verify')!;
        fillVerification(verification);
        submit(verification);

        await vi.waitFor(() => expect(dialog.textContent).toContain('Что-то пошло не так'));
        expect(trace).not.toContain('/endpoints/Customer/BonusProfile');
        expect(trace).not.toContain('Mindbox:Website.BonusAccountActivation');
    });
});
