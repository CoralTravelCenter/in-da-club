import type {RegistrationData} from './customer-api';
import {typographed} from '../shared/typography';

export async function applyConsents(data: RegistrationData, acceptedDocuments: Set<string>): Promise<void> {
    const response = await fetch('https://apishar.coral.school/consents/api/documentlist/coral.ru');
    if (!response.ok) throw new Error(typographed`Не удалось загрузить документы согласий`);
    const documents = await response.json() as Array<{
        docId: number;
        project_id: number;
        doctype_id: number;
        is_active: boolean
    }>;
    const confirmation: Record<number, boolean> = {
        23: data.isConsentToSms,
        24: data.isConsentToAdditional,
        25: data.isConsentToPersonalData,
    };
    const active = documents.filter((document) => document.is_active && [23, 24, 25].includes(document.doctype_id));
    const pending = active.filter((document) => !acceptedDocuments.has(`${document.project_id}:${document.docId}`));
    const requests = pending.map((document) => fetch('https://apishar.coral.school/consents/api/accept', {
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
    }));
    const results = await Promise.allSettled(requests);
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.ok) {
            const document = pending[index];
            acceptedDocuments.add(`${document.project_id}:${document.docId}`);
        }
    });
    if (results.some((result) => result.status === 'rejected' || !result.value.ok)) {
        throw new Error(typographed`Не удалось сохранить согласия`);
    }
}
