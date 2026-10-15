import {describe, expect, it} from 'vitest';
import {displayPhone, isKnownCity, isValidPhone, parseBirthdate, registrationDataFromForm} from './registration';

describe('registration model', () => {
    it.each([
        ['02 / 01 / 1990', '1990-01-02'],
        ['31 / 02 / 1990', null],
        ['1990-01-02', null],
    ])('разбирает дату %s', (value, expected) => {
        expect(parseBirthdate(value)).toBe(expected);
    });

    it('проверяет телефон и форматирует российский номер', () => {
        expect(isValidPhone('+7 (999) 000-00-00')).toBe(true);
        expect(displayPhone('89990000000')).toBe('+7 (999) 000-00-00');
        expect(isValidPhone('123')).toBe(false);
    });

    it('принимает только город из справочника', () => {
        expect(isKnownCity(' Москва ')).toBe(true);
        expect(isKnownCity('Несуществующий город')).toBe(false);
    });

    it('преобразует данные формы в контракт регистрации', () => {
        const formData = new FormData();
        formData.set('givenName', ' Анна ');
        formData.set('familyName', ' Тестова ');
        formData.set('email', 'anna@example.test');
        formData.set('gender', '2');
        formData.set('birthDate', '02 / 01 / 1990');
        formData.set('city', ' Москва ');
        formData.set('personal', 'on');
        formData.set('loyalty', 'on');
        formData.set('mobilePhone', '8 (999) 000-00-00');

        expect(registrationDataFromForm(formData, 'TEST_PROMO', '/club')).toEqual({
            givenName: 'Анна',
            familyName: 'Тестова',
            middleName: '',
            email: 'anna@example.test',
            gender: 2,
            birthDate: '1990-01-02',
            city: 'Москва',
            isConsentToPersonalData: true,
            isConsentToSms: true,
            isConsentToEmail: true,
            isConsentToAdditional: false,
            mobilePhone: '79990000000',
            Promo: 'TEST_PROMO',
            FromPageUrl: '/club',
        });
    });
});
