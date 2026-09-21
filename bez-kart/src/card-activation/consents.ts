import type {RegistrationData} from './customer-api';
import {request, requestJson} from './http';
import {typographed} from '@/shared/typography';

interface ConsentDocument {
    docId: number;
    project_id: number;
    doctype_id: number;
    is_active: boolean;
}

const DOCUMENT_LIST_URL = 'https://apishar.coral.school/consents/api/documentlist/coral.ru';
const ACCEPT_URL = 'https://apishar.coral.school/consents/api/accept';
const LOAD_ERROR = typographed`Не удалось загрузить документы согласий`;
const SAVE_ERROR = typographed`Не удалось сохранить согласия`;

function isConsentDocument(value: unknown): value is ConsentDocument {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const document = value as Record<string, unknown>;
    return Number.isInteger(document.docId)
        && Number.isInteger(document.project_id)
        && Number.isInteger(document.doctype_id)
        && typeof document.is_active === 'boolean';
}

async function getConsentDocuments(): Promise<ConsentDocument[]> {
    const payload = await requestJson(DOCUMENT_LIST_URL, {}, LOAD_ERROR);
    if (!Array.isArray(payload) || !payload.every(isConsentDocument)) {
        throw new Error(LOAD_ERROR);
    }
    return payload;
}

export async function applyConsents(data: RegistrationData, acceptedDocuments: Map<string, boolean>): Promise<void> {
    const documents = await getConsentDocuments();
    const confirmation: Record<number, boolean> = {
        23: data.isConsentToSms,
        24: data.isConsentToAdditional,
        25: data.isConsentToPersonalData,
    };
    const active = documents.filter((document) => document.is_active && [23, 24, 25].includes(document.doctype_id));
    const pending = active.filter((document) =>
        acceptedDocuments.get(`${document.project_id}:${document.docId}`) !== confirmation[document.doctype_id],
    );
    const requests = pending.map(async (document) => {
        await request(ACCEPT_URL, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                DocumentId: document.docId,
                ProjectId: document.project_id,
                FName: `${data.givenName} ${data.familyName}`,
                PhoneNumber: data.mobilePhone,
                Email: data.email,
                IPLocation: '',
                FUrl: location.origin,
                Confirm: confirmation[document.doctype_id],
                FormPage: location.href,
            }),
        }, SAVE_ERROR);
        acceptedDocuments.set(`${document.project_id}:${document.docId}`, confirmation[document.doctype_id]);
    });

    const results = await Promise.allSettled(requests);
    if (results.some((result) => result.status === 'rejected')) {
        throw new Error(SAVE_ERROR);
    }
}
