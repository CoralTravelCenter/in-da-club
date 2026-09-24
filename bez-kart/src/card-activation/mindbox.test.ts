// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {sendBonusAccountActivation, sendBonusAccountRegistration} from './mindbox';

describe('Mindbox bonus account operations', () => {
    const mindbox = vi.fn();
    const operationDate = new Date('2026-09-24T09:00:00.000Z');

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(operationDate);
        window.localStorage.clear();
        window.localStorage.setItem('user', JSON.stringify({nameId: 42}));
        Object.assign(window, {mindbox});
        mindbox.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
        Reflect.deleteProperty(window, 'mindbox');
        vi.restoreAllMocks();
    });

    it('отправляет регистрацию с идентификатором клиента, городом и единым временем', () => {
        sendBonusAccountRegistration('Москва');

        expect(mindbox).toHaveBeenCalledWith('async', {
            operation: 'Website.BonusAccountRegistration',
            data: {
                executionDateTimeUtc: operationDate,
                customer: {
                    ids: {clientId: '42'},
                    customFields: {
                        isIssuedByCB: true,
                        bonusAccountStatus: 1,
                        bonusAccountRegistrationDate: operationDate,
                        bonusAccountCity: 'Москва',
                    },
                },
            },
        });
    });

    it('отправляет активацию с соответствующими статусом и датой', () => {
        sendBonusAccountActivation('Казань');

        expect(mindbox).toHaveBeenCalledWith('async', expect.objectContaining({
            operation: 'Website.BonusAccountActivation',
            data: expect.objectContaining({
                customer: expect.objectContaining({
                    customFields: expect.objectContaining({
                        bonusAccountStatus: 2,
                        bonusAccountActivationDate: operationDate,
                        bonusAccountCity: 'Казань',
                    }),
                }),
            }),
        }));
    });

    it('не ломает сценарий без clientId или глобальной функции Mindbox', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        window.localStorage.setItem('user', '{invalid');

        expect(() => sendBonusAccountRegistration('Москва')).not.toThrow();
        expect(mindbox).not.toHaveBeenCalled();

        window.localStorage.setItem('user', JSON.stringify({nameId: 42}));
        Reflect.deleteProperty(window, 'mindbox');
        expect(() => sendBonusAccountActivation('Москва')).not.toThrow();
        expect(consoleError).toHaveBeenCalledTimes(2);
    });

    it('перехватывает исключение Mindbox', () => {
        const error = new Error('Mindbox unavailable');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mindbox.mockImplementationOnce(() => { throw error; });

        expect(() => sendBonusAccountRegistration('Москва')).not.toThrow();
        expect(consoleError).toHaveBeenCalledWith(
            'CoralBonus: failed to send Mindbox operation',
            {operation: 'Website.BonusAccountRegistration', error},
        );
    });
});
