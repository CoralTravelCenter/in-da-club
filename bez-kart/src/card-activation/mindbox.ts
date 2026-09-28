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
    onSuccess: () => void;
    onError: (error: unknown) => void;
}

type Mindbox = (method: 'async', payload: MindboxPayload) => void;
const MINDBOX_RETRY_DELAYS_MS = [250, 1_000, 3_000] as const;

function sendBonusAccountOperation(
    operation: MindboxOperation,
    status: BonusAccountStatus,
    dateField: BonusAccountDateField,
    city: string,
    additionalCustomFields: {bonusLevel?: string; bonusAccountNumber?: string} = {},
    explicitClientId?: unknown,
): void {
    const nameId = explicitClientId ?? getProfile()?.nameId;
    const clientId = (typeof nameId === 'string' || typeof nameId === 'number') && nameId
        ? String(nameId)
        : '';
    if (!clientId) {
        console.error('CoralBonus: failed to send Mindbox operation', {operation});
        return;
    }

    const operationDate = new Date();
    const payload: MindboxPayload = {
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
        onSuccess: () => {},
        onError: (error) => {
            console.error('CoralBonus: Mindbox operation failed', {operation, error});
        },
    };

    const trySend = (attempt: number): void => {
        const mindbox = (window as Window & {mindbox?: Mindbox}).mindbox;
        if (typeof mindbox !== 'function') {
            const retryDelay = MINDBOX_RETRY_DELAYS_MS[attempt];
            if (retryDelay !== undefined) {
                window.setTimeout(() => trySend(attempt + 1), retryDelay);
                return;
            }
            console.error('CoralBonus: failed to send Mindbox operation', {operation});
            return;
        }

        try {
            mindbox('async', payload);
        } catch (error) {
            const retryDelay = MINDBOX_RETRY_DELAYS_MS[attempt];
            if (retryDelay !== undefined) {
                window.setTimeout(() => trySend(attempt + 1), retryDelay);
                return;
            }
            console.error('CoralBonus: failed to send Mindbox operation', {operation, error});
        }
    };

    trySend(0);
}

export function sendBonusAccountRegistration(city: string, clientId?: unknown): void {
    sendBonusAccountOperation(
        'Website.BonusAccountRegistration',
        1,
        'bonusAccountRegistrationDate',
        city,
        {},
        clientId,
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
