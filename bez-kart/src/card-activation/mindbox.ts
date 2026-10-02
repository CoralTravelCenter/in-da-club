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
const pendingRegistrations = new Map<string, symbol>();

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

    const registrationAttempt = status === 1 ? Symbol('registration') : undefined;
    if (registrationAttempt) {
        pendingRegistrations.set(clientId, registrationAttempt);
    } else {
        pendingRegistrations.delete(clientId);
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
        onSuccess: () => {
            console.info('CoralBonus: Mindbox operation succeeded', {
                operation,
                clientId,
                bonusAccountStatus: status,
                bonusLevel: additionalCustomFields.bonusLevel,
                bonusAccountNumber: additionalCustomFields.bonusAccountNumber,
            });
        },
        onError: (error) => {
            console.error('CoralBonus: Mindbox operation failed', {
                operation,
                clientId,
                bonusAccountStatus: status,
                bonusLevel: additionalCustomFields.bonusLevel,
                bonusAccountNumber: additionalCustomFields.bonusAccountNumber,
                error,
            });
        },
    };

    const trySend = (attempt: number): void => {
        if (registrationAttempt && pendingRegistrations.get(clientId) !== registrationAttempt) return;

        const mindbox = (window as Window & {mindbox?: Mindbox}).mindbox;
        if (typeof mindbox !== 'function') {
            const retryDelay = MINDBOX_RETRY_DELAYS_MS[attempt];
            if (retryDelay !== undefined) {
                window.setTimeout(() => trySend(attempt + 1), retryDelay);
                return;
            }
            if (registrationAttempt) pendingRegistrations.delete(clientId);
            console.error('CoralBonus: failed to send Mindbox operation', {operation});
            return;
        }

        try {
            mindbox('async', payload);
            if (registrationAttempt) pendingRegistrations.delete(clientId);
        } catch (error) {
            const retryDelay = MINDBOX_RETRY_DELAYS_MS[attempt];
            if (retryDelay !== undefined) {
                window.setTimeout(() => trySend(attempt + 1), retryDelay);
                return;
            }
            if (registrationAttempt) pendingRegistrations.delete(clientId);
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
    clientId?: unknown,
): void {
    sendBonusAccountOperation(
        'Website.BonusAccountActivation',
        2,
        'bonusAccountActivationDate',
        city,
        {bonusLevel, bonusAccountNumber},
        clientId,
    );
}
