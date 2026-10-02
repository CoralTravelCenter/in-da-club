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
        sendBonusAccountRegistration('Москва', 42);

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
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
        });
    });

    it('отправляет активацию с соответствующими статусом и датой', () => {
        sendBonusAccountActivation('Казань', 'Gold', '12345678901');

        expect(mindbox).toHaveBeenCalledWith('async', expect.objectContaining({
            operation: 'Website.BonusAccountActivation',
            data: expect.objectContaining({
                customer: expect.objectContaining({
                    customFields: expect.objectContaining({
                        bonusAccountStatus: 2,
                        bonusAccountActivationDate: operationDate,
                        bonusAccountCity: 'Казань',
                        bonusLevel: 'Gold',
                        bonusAccountNumber: '12345678901',
                    }),
                }),
            }),
        }));
    });

    it('не ломает сценарий без clientId', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        window.localStorage.setItem('user', '{invalid');

        expect(() => sendBonusAccountRegistration('Москва')).not.toThrow();
        expect(mindbox).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
    });

    it('повторяет отправку после появления глобальной функции Mindbox', async () => {
        Reflect.deleteProperty(window, 'mindbox');

        sendBonusAccountRegistration('Москва', 42);
        Object.assign(window, {mindbox});
        await vi.advanceTimersByTimeAsync(250);

        expect(mindbox).toHaveBeenCalledOnce();
    });

    it('отменяет отложенную регистрацию, если для того же клиента уже запущена активация', async () => {
        Reflect.deleteProperty(window, 'mindbox');
        sendBonusAccountRegistration('Москва', 42);
        sendBonusAccountActivation('Москва', 'Gold', '12345678901', 42);
        Object.assign(window, {mindbox});

        await vi.advanceTimersByTimeAsync(250);

        expect(mindbox).toHaveBeenCalledOnce();
        expect(mindbox).toHaveBeenCalledWith('async', expect.objectContaining({
            operation: 'Website.BonusAccountActivation',
        }));
    });

    it('использует явный clientId для активации', () => {
        window.localStorage.setItem('user', JSON.stringify({nameId: 99}));

        sendBonusAccountActivation('Казань', 'Gold', '12345678901', 42);

        expect(mindbox).toHaveBeenCalledWith('async', expect.objectContaining({
            data: expect.objectContaining({
                customer: expect.objectContaining({ids: {clientId: '42'}}),
            }),
        }));
    });

    it('повторяет отправку после исключения Mindbox и не дублирует успешную операцию', async () => {
        const error = new Error('Mindbox unavailable');
        mindbox.mockImplementationOnce(() => { throw error; });

        expect(() => sendBonusAccountRegistration('Москва')).not.toThrow();
        await vi.advanceTimersByTimeAsync(250);

        expect(mindbox).toHaveBeenCalledTimes(2);
        await vi.runAllTimersAsync();
        expect(mindbox).toHaveBeenCalledTimes(2);
    });

    it('логирует асинхронную ошибку Mindbox, не выбрасывая исключение', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        sendBonusAccountRegistration('Москва', 42);
        const payload = mindbox.mock.calls[0]?.[1] as {onError?: (error: unknown) => void};
        const error = new Error('Mindbox rejected operation');

        expect(() => payload.onError?.(error)).not.toThrow();
        expect(consoleError).toHaveBeenCalledWith(
            'CoralBonus: Mindbox operation failed',
            {
                operation: 'Website.BonusAccountRegistration',
                clientId: '42',
                bonusAccountStatus: 1,
                bonusLevel: undefined,
                bonusAccountNumber: undefined,
                error,
            },
        );
    });

    it('логирует успешную активацию с фактическими полями', () => {
        const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
        sendBonusAccountActivation('Казань', 'Gold', '12345678901', 42);
        const payload = mindbox.mock.calls[0]?.[1] as {onSuccess?: () => void};

        payload.onSuccess?.();

        expect(consoleInfo).toHaveBeenCalledWith(
            'CoralBonus: Mindbox operation succeeded',
            {
                operation: 'Website.BonusAccountActivation',
                clientId: '42',
                bonusAccountStatus: 2,
                bonusLevel: 'Gold',
                bonusAccountNumber: '12345678901',
            },
        );
    });
});
