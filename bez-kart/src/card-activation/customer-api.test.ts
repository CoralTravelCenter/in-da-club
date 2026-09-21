import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {activateCard, getBonusProfile, normalizePhone, refreshUser, registerCard, sendVerificationCode, type RegistrationData} from './customer-api';

const registration: RegistrationData = {
    givenName: 'Анна',
    familyName: 'Тестова',
    middleName: '',
    email: 'anna@example.test',
    gender: 1,
    birthDate: '1990-01-02',
    city: 'Москва',
    isConsentToPersonalData: true,
    isConsentToSms: true,
    isConsentToEmail: true,
    isConsentToAdditional: false,
    mobilePhone: '79990000000',
};

function response(body: unknown, ok = true, status = 200): Response {
    return {ok, status, json: async () => body} as Response;
}

describe('Customer API', () => {
    const fetchMock = vi.fn();
    const storage = new Map<string, string>();

    beforeEach(() => {
        fetchMock.mockReset();
        storage.clear();
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('window', {
            localStorage: {
                getItem: (key: string) => storage.get(key) ?? null,
                setItem: (key: string, value: string) => { storage.set(key, value); },
            },
        });
    });

    afterEach(() => vi.unstubAllGlobals());

    it('регистрирует карту с полным телом запроса и принимает строковые fallback успеха', async () => {
        for (const success of [true, 'True', 'true']) {
            fetchMock.mockResolvedValueOnce(response({result: {isSuccess: success}}));
            await registerCard(registration);
        }

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock).toHaveBeenCalledWith('/endpoints/Customer/BonusRegister', expect.objectContaining({
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(registration),
        }));
    });

    it('передаёт номер и код в соответствующие операции', async () => {
        fetchMock.mockResolvedValue(response({result: {isSuccess: true}}));

        await sendVerificationCode(registration.mobilePhone);
        await activateCard(registration.mobilePhone, '123456');

        expect(fetchMock.mock.calls.map(([url, options]) => [url, JSON.parse(options.body)])).toEqual([
            ['/endpoints/Customer/BonusSendVerificationCode', {mobilePhone: registration.mobilePhone}],
            ['/endpoints/Customer/BonusActivation', {mobilePhone: registration.mobilePhone, activationCode: '123456'}],
        ]);
    });

    it('загружает профиль карты для финального экрана', async () => {
        const bonus = {cardType: 'Gold', cardNumber: '12345678901'};
        fetchMock.mockResolvedValueOnce(response({result: bonus}));

        await expect(getBonusProfile()).resolves.toEqual(bonus);
        expect(fetchMock).toHaveBeenCalledWith('/endpoints/Customer/BonusProfile', expect.objectContaining({
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: '{}',
        }));
    });

    it('сообщает об отказе API и HTTP-ошибке', async () => {
        fetchMock.mockResolvedValueOnce(response({result: {isSuccess: false, errorMessage: 'Отказ регистрации'}}));
        await expect(registerCard(registration)).rejects.toThrow('Отказ регистрации');

        fetchMock.mockResolvedValueOnce(response({}, false, 503));
        await expect(sendVerificationCode(registration.mobilePhone)).rejects.toThrow('Не\u00a0удалось отправить\u00a0код. Проверьте подключение к\u00a0интернету и\u00a0попробуйте ещё раз');

        fetchMock.mockResolvedValueOnce(response({}, false, 400));
        await expect(activateCard(registration.mobilePhone, '000000')).rejects.toThrow('Неверный код или\u00a0срок его действия истёк. Попробуйте ещё раз');
    });

    it('показывает понятную ошибку при сбое сети во время отправки кода', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(sendVerificationCode(registration.mobilePhone)).rejects.toThrow(
            'Не\u00a0удалось отправить\u00a0код. Проверьте подключение к\u00a0интернету и\u00a0попробуйте ещё раз',
        );
    });

    it('показывает понятную ошибку при некорректном JSON', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
        });

        await expect(sendVerificationCode(registration.mobilePhone)).rejects.toThrow(
            'Не\u00a0удалось отправить\u00a0код. Проверьте подключение к\u00a0интернету и\u00a0попробуйте ещё раз',
        );
    });

    it('обновляет только Bonus-поля профиля из нового токена', async () => {
        storage.set('user', JSON.stringify({name: 'Анна', BonusUserId: 1}));
        const payload = btoa(JSON.stringify({name: 'Other name', BonusUserId: 42, BonusLevel: 'Gold'}));
        fetchMock.mockResolvedValueOnce(response({result: {token: `header.${payload}.signature`}}));

        await expect(refreshUser()).resolves.toBe(true);
        expect(JSON.parse(storage.get('user') ?? '{}')).toEqual({name: 'Анна', BonusUserId: 42, BonusLevel: 'Gold'});
    });

    it('не записывает профиль при ответе без токена', async () => {
        fetchMock.mockResolvedValueOnce(response({result: {}}));
        await expect(refreshUser()).resolves.toBe(false);
        expect(storage.has('user')).toBe(false);
    });

    it('не записывает профиль при повреждённом JWT', async () => {
        storage.set('user', JSON.stringify({name: 'Анна'}));
        fetchMock.mockResolvedValueOnce(response({result: {token: 'invalid-token'}}));

        await expect(refreshUser()).resolves.toBe(false);
        expect(JSON.parse(storage.get('user') ?? '{}')).toEqual({name: 'Анна'});
    });

    it('нормализует десятизначный номер', () => {
        expect(normalizePhone('(999) 000-00-00')).toBe('79990000000');
    });
});
