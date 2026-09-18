import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {applyConsents} from './consents';
import type {RegistrationData} from './customer-api';

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

const documents = [
    {docId: 101, project_id: 7, doctype_id: 23, is_active: true},
    {docId: 102, project_id: 7, doctype_id: 24, is_active: true},
    {docId: 103, project_id: 7, doctype_id: 25, is_active: false},
    {docId: 104, project_id: 7, doctype_id: 99, is_active: true},
];

function response(body: unknown, ok = true): Response {
    return {ok, json: async () => body} as Response;
}

describe('consents API', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
        vi.stubGlobal('location', {origin: 'https://www.coral.ru', href: 'https://www.coral.ru/club'});
    });

    afterEach(() => vi.unstubAllGlobals());

    it('отправляет только активные нужные документы с корректными флагами и контекстом страницы', async () => {
        fetchMock.mockResolvedValueOnce(response(documents));
        fetchMock.mockResolvedValue(response({}));
        const accepted = new Map<string, boolean>();

        await applyConsents(registration, accepted);

        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock.mock.calls[0][0]).toBe('https://apishar.coral.school/consents/api/documentlist/coral.ru');
        const bodies = fetchMock.mock.calls.slice(1).map(([, options]) => JSON.parse(options.body));
        expect(bodies).toEqual([
            expect.objectContaining({DocumentId: 101, ProjectId: 7, Confirm: true, FName: 'Анна Тестова', PhoneNumber: registration.mobilePhone, FUrl: 'https://www.coral.ru', FormPage: 'https://www.coral.ru/club'}),
            expect.objectContaining({DocumentId: 102, ProjectId: 7, Confirm: false}),
        ]);
        expect(accepted).toEqual(new Map([['7:101', true], ['7:102', false]]));
    });

    it('после частичного отказа повторяет только неуспешное согласие', async () => {
        let failedOnce = false;
        fetchMock.mockImplementation((url: string, options?: RequestInit) => {
            if (url.includes('documentlist')) return Promise.resolve(response(documents));
            const id = JSON.parse(String(options?.body)).DocumentId as number;
            if (id === 102 && !failedOnce) {
                failedOnce = true;
                return Promise.resolve(response({}, false));
            }
            return Promise.resolve(response({}));
        });
        const accepted = new Map<string, boolean>();

        await expect(applyConsents(registration, accepted)).rejects.toThrow('Не\u00a0удалось сохранить согласия');
        expect(accepted).toEqual(new Map([['7:101', true]]));

        await applyConsents(registration, accepted);
        const acceptedIds = fetchMock.mock.calls
            .filter(([url]) => String(url).includes('/accept'))
            .map(([, options]) => JSON.parse(options.body).DocumentId);
        expect(acceptedIds).toEqual([101, 102, 102]);
        expect(accepted).toEqual(new Map([['7:101', true], ['7:102', false]]));
    });

    it('повторно отправляет документ при изменении необязательного согласия', async () => {
        let failedOnce = false;
        fetchMock.mockImplementation((url: string, options?: RequestInit) => {
            if (url.includes('documentlist')) return Promise.resolve(response(documents));
            const id = JSON.parse(String(options?.body)).DocumentId as number;
            if (id === 101 && !failedOnce) {
                failedOnce = true;
                return Promise.resolve(response({}, false));
            }
            return Promise.resolve(response({}));
        });
        const accepted = new Map<string, boolean>();

        await expect(applyConsents(registration, accepted)).rejects.toThrow('Не\u00a0удалось сохранить согласия');
        expect(accepted).toEqual(new Map([['7:102', false]]));

        await applyConsents({...registration, isConsentToAdditional: true}, accepted);
        expect(accepted).toEqual(new Map([['7:101', true], ['7:102', true]]));

        await applyConsents(registration, accepted);
        expect(accepted).toEqual(new Map([['7:101', true], ['7:102', false]]));
        const sent = fetchMock.mock.calls
            .filter(([url]) => String(url).includes('/accept'))
            .map(([, options]) => {
                const {DocumentId, Confirm} = JSON.parse(String(options.body));
                return [DocumentId, Confirm];
            });
        expect(sent).toEqual([[101, true], [102, false], [101, true], [102, true], [102, false]]);
    });

    it('останавливается при ошибке загрузки документов', async () => {
        fetchMock.mockResolvedValueOnce(response({}, false));
        await expect(applyConsents(registration, new Map())).rejects.toThrow('Не\u00a0удалось загрузить документы согласий');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
