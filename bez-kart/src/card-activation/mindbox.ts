import {getProfile} from './profile';

type MindboxOperation = 'Website.BonusAccountRegistration' | 'Website.BonusAccountActivation';
type BonusAccountStatus = 1 | 2;
type BonusAccountDateField = 'bonusAccountRegistrationDate' | 'bonusAccountActivationDate';

interface MindboxPayload {
    operation: MindboxOperation;
    data: {
        executionDateTimeUtc: Date;
        customer: {
            ids: {
                clientId: string;
            };
            customFields: {
                isIssuedByCB: true;
                bonusAccountStatus: BonusAccountStatus;
                bonusAccountCity: string;
                bonusAccountRegistrationDate?: Date;
                bonusAccountActivationDate?: Date;
                bonusLevel?: string;
                bonusAccountNumber?: string;
            };
        };
    };
}

type Mindbox = (method: 'async', payload: MindboxPayload) => void;

function sendBonusAccountOperation(
    operation: MindboxOperation,
    status: BonusAccountStatus,
    dateField: BonusAccountDateField,
    city: string,
    additionalCustomFields: {bonusLevel?: string; bonusAccountNumber?: string} = {},
): void {
    const nameId = getProfile()?.nameId;
    const clientId = nameId ? String(nameId) : '';
    const mindbox = (window as Window & {mindbox?: Mindbox}).mindbox;
    if (!clientId || typeof mindbox !== 'function') {
        console.error('CoralBonus: failed to send Mindbox operation', {operation});
        return;
    }

    try {
        const operationDate = new Date();
        mindbox('async', {
            operation,
            data: {
                executionDateTimeUtc: operationDate,
                customer: {
                    ids: {clientId},
                    customFields: {
                        isIssuedByCB: true,
                        bonusAccountStatus: status,
                        [dateField]: operationDate,
                        bonusAccountCity: city,
                        ...additionalCustomFields,
                    },
                },
            },
        });
    } catch (error) {
        console.error('CoralBonus: failed to send Mindbox operation', {operation, error});
    }
}

export function sendBonusAccountRegistration(city: string): void {
    sendBonusAccountOperation(
        'Website.BonusAccountRegistration',
        1,
        'bonusAccountRegistrationDate',
        city,
    );
}

export function sendBonusAccountActivation(
    city: string,
    bonusLevel: string | undefined,
    bonusAccountNumber: string | undefined,
): void {
    sendBonusAccountOperation(
        'Website.BonusAccountActivation',
        2,
        'bonusAccountActivationDate',
        city,
        {bonusLevel, bonusAccountNumber},
    );
}
