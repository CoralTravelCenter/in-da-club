interface UserProfile {
    name?: string;
    surname?: string;
    gender?: string | number;
    birthdate?: string;
    email?: string;
    mobilePhone?: string;
    BonusUserId?: string | number;

    [key: string]: unknown;
}

interface RegistrationData {
    givenName: string;
    familyName: string;
    middleName: string;
    email: string;
    gender: number;
    birthDate: string;
    city: string;
    isConsentToPersonalData: boolean;
    isConsentToSms: boolean;
    isConsentToEmail: boolean;
    isConsentToAdditional: boolean;
    mobilePhone: string;
}

interface CoralPopupElement extends HTMLElement {
    show: () => Promise<void> | void;
    hide: () => void;
}

const LOGIN_BUTTON_SELECTOR = '[class*="LoginButton_loginButton"]';
const DIALOG_ID = 'bez-kart-card-activation';

function getProfile(): UserProfile | null {
    try {
        const value = window.localStorage.getItem('user');
        return value ? JSON.parse(value) as UserProfile : null;
    } catch {
        return null;
    }
}

function isSuccess(value: unknown): boolean {
    return value === true || value === 'True' || value === 'true';
}

async function postJson<T>(url: string, body: object): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

function waitForLogin(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
        const initialProfile = getProfile();
        if (initialProfile) {
            resolve(initialProfile);
            return;
        }

        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const profile = getProfile();
            if (profile) {
                finish(profile);
            } else if (Date.now() - startedAt > 120_000) {
                finish(null);
            }
        }, 300);

        const onClick = (event: MouseEvent): void => {
            if ((event.target as Element | null)?.closest('.ant-modal-close')) {
                finish(null);
            }
        };
        const onKeydown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                finish(null);
            }
        };
        const finish = (profile: UserProfile | null): void => {
            window.clearInterval(interval);
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKeydown);
            resolve(profile);
        };

        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKeydown);
    });
}

function formatBirthdate(value?: string): string {
    if (!value) return '';
    const sourceDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (sourceDate) {
        const [, month, day, year] = sourceDate;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizePhone(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 ? `7${digits}` : digits;
}

function setStep(dialog: CoralPopupElement, step: number): void {
    dialog.querySelectorAll<HTMLElement>('[data-step-mark]').forEach((mark, index) => {
        mark.dataset.state = index < step ? 'complete' : index === step ? 'current' : 'upcoming';
    });
}

function showMessage(container: HTMLElement, message: string): void {
    let error = container.querySelector<HTMLElement>('.bez-kart-activation__error');
    if (!error) {
        error = document.createElement('p');
        error.className = 'bez-kart-activation__error';
        error.setAttribute('role', 'alert');
        container.append(error);
    }
    error.textContent = message;
}

async function openPopup(popup: CoralPopupElement): Promise<void> {
    await customElements.whenDefined('coral-popup');
    await popup.show();
}

function createDialog(): CoralPopupElement {
    document.getElementById(DIALOG_ID)?.remove();
    const dialog = document.createElement('coral-popup') as CoralPopupElement;
    dialog.id = DIALOG_ID;
    dialog.className = 'bez-kart-activation';
    dialog.setAttribute('aria-labelledby', `${DIALOG_ID}-title`);
    dialog.innerHTML = `
        <div class="bez-kart-activation__banner" aria-hidden="true"></div>
        <div class="bez-kart-activation__panel">
            <div class="bez-kart-activation__steps" aria-label="Шаг 1 из 3">
                <span data-step-mark data-state="current">1</span><i></i>
                <span data-step-mark data-state="upcoming">2</span><i></i>
                <span data-step-mark data-state="upcoming">3</span>
            </div>
            <div class="bez-kart-activation__stage"></div>
        </div>`;

    document.body.append(dialog);
    return dialog;
}

function renderRegistration(dialog: CoralPopupElement, profile: UserProfile): void {
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;

    stage.innerHTML = `
        <form class="bez-kart-activation__form">
            <h2 id="${DIALOG_ID}-title">Оформление карты</h2>
            <label><span>Фамилия <b>*</b></span><input name="familyName" required autocomplete="family-name"></label>
            <label><span>Имя <b>*</b></span><input name="givenName" required autocomplete="given-name"></label>
            <div class="bez-kart-activation__row">
                <fieldset>
                    <legend>Пол <b>*</b></legend>
                    <div class="bez-kart-activation__gender-options">
                        <label><input type="radio" name="gender" value="0" required><span>М</span></label>
                        <label><input type="radio" name="gender" value="1"><span>Ж</span></label>
                    </div>
                </fieldset>
                <label><span>Дата рождения <b>*</b></span><input type="date" name="birthDate" required autocomplete="bday"></label>
            </div>
            <label><span>Город <b>*</b></span><input name="city" required autocomplete="address-level2"></label>
            <label><span>Электронная почта <b>*</b></span><input type="email" name="email" required readonly autocomplete="email"></label>
            <label><span>Телефон <b>*</b></span><input type="tel" name="mobilePhone" required readonly autocomplete="tel"></label>
            <div class="bez-kart-activation__consents">
                <label><input type="checkbox" name="personal" required> <span><b>*</b> Даю согласие на обработку персональных данных. <a href="https://cdn.coral.ru/content/doc/legal/privacy_policy_coral.pdf" target="_blank" rel="noopener">Политика обработки персональных данных</a></span></label>
                <label><input type="checkbox" name="loyalty" required> <span><b>*</b> Ознакомлен и согласен с <a href="https://b2ccdn.coral.ru/content/doc/legal/pravila-loyalty-program-22062026.pdf" target="_blank" rel="noopener">Правилами Программы лояльности</a></span></label>
                <label><input type="checkbox" name="offers"> <span>Даю согласие на получение новостей, акций и специальных предложений.</span></label>
            </div>
            <button class="bez-kart-activation__submit" type="submit">Получить код по SMS</button>
        </form>`;

    const form = stage.querySelector<HTMLFormElement>('form');
    if (!form) return;
    const setValue = (name: string, value: string): void => {
        const input = form.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = value;
    };
    setValue('familyName', profile.surname ?? '');
    setValue('givenName', profile.name ?? '');
    setValue('birthDate', formatBirthdate(profile.birthdate));
    setValue('email', profile.email ?? '');
    setValue('mobilePhone', profile.mobilePhone ?? '');
    const gender = String(profile.gender ?? '').toUpperCase();
    const genderInput = form.querySelector<HTMLInputElement>(`input[name="gender"][value="${gender === 'F' || gender === '1' ? '1' : '0'}"]`);
    if (genderInput) genderInput.checked = true;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
        const data = new FormData(form);
        const registration: RegistrationData = {
            givenName: String(data.get('givenName') ?? '').trim(),
            familyName: String(data.get('familyName') ?? '').trim(),
            middleName: '',
            email: String(data.get('email') ?? ''),
            gender: Number(data.get('gender')),
            birthDate: String(data.get('birthDate') ?? ''),
            city: String(data.get('city') ?? '').trim(),
            isConsentToPersonalData: data.get('personal') === 'on',
            isConsentToSms: data.get('loyalty') === 'on',
            isConsentToEmail: data.get('loyalty') === 'on',
            isConsentToAdditional: data.get('offers') === 'on',
            mobilePhone: normalizePhone(String(data.get('mobilePhone') ?? '')),
        };

        try {
            if (submit) submit.disabled = true;
            const response = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
                '/endpoints/Customer/BonusRegister', registration,
            );
            if (!isSuccess(response.result?.isSuccess)) {
                throw new Error(response.result?.errorMessage || 'Не удалось оформить карту');
            }
            await applyConsents(registration);
            await renderVerification(dialog, registration);
        } catch (error) {
            showMessage(form, error instanceof Error ? error.message : 'Не удалось оформить карту');
            if (submit) submit.disabled = false;
        }
    });
}

async function applyConsents(data: RegistrationData): Promise<void> {
    const response = await fetch('https://apishar.coral.school/consents/api/documentlist/coral.ru');
    if (!response.ok) throw new Error('Не удалось загрузить документы согласий');
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
    const requests = active.map((document) => fetch('https://apishar.coral.school/consents/api/accept', {
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
    const results = await Promise.all(requests);
    if (results.some((result) => !result.ok)) throw new Error('Не удалось сохранить согласия');
}

async function renderVerification(dialog: CoralPopupElement, data: RegistrationData): Promise<void> {
    setStep(dialog, 1);
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    stage.innerHTML = '<div class="bez-kart-activation__status">Отправляем код активации…</div>';

    try {
        const response = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
            '/endpoints/Customer/BonusSendVerificationCode', {mobilePhone: data.mobilePhone},
        );
        if (!isSuccess(response.result?.isSuccess)) {
            throw new Error(response.result?.errorMessage || 'Не удалось отправить код');
        }
        stage.innerHTML = `
            <form class="bez-kart-activation__verify">
                <h2 id="${DIALOG_ID}-title">Введите код из SMS</h2>
                <p>Отправили код активации на номер<br><strong>${data.mobilePhone}</strong></p>
                <input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" aria-label="Код из SMS" required>
                <button class="bez-kart-activation__submit" type="submit">Активировать</button>
            </form>`;
        const form = stage.querySelector<HTMLFormElement>('form');
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const code = new FormData(form).get('code');
            try {
                const activation = await postJson<{ result?: { isSuccess?: unknown; errorMessage?: string } }>(
                    '/endpoints/Customer/BonusActivation', {
                        mobilePhone: data.mobilePhone,
                        activationCode: String(code ?? ''),
                    },
                );
                if (!isSuccess(activation.result?.isSuccess)) {
                    throw new Error(activation.result?.errorMessage || 'Неверный код — попробуйте ещё раз');
                }
                await renderSuccess(dialog);
            } catch (error) {
                showMessage(form, error instanceof Error ? error.message : 'Не удалось активировать карту');
            }
        });
    } catch (error) {
        showMessage(stage, error instanceof Error ? error.message : 'Не удалось отправить код');
    }
}

async function refreshUser(): Promise<void> {
    const response = await postJson<{ result?: { token?: string } }>('/endpoints/Customer/RefreshLogin', {});
    const token = response.result?.token;
    if (!token) return;
    const payload = token.split('.')[1];
    if (!payload) return;
    const decoded = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))))) as UserProfile;
    const current = getProfile() ?? {};
    for (const [key, value] of Object.entries(decoded)) {
        if (key.startsWith('Bonus')) current[key] = value;
    }
    window.localStorage.setItem('user', JSON.stringify(current));
}

async function renderSuccess(dialog: CoralPopupElement): Promise<void> {
    setStep(dialog, 2);
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (!stage) return;
    stage.innerHTML = '<div class="bez-kart-activation__status">Проверяем…</div>';
    try {
        await refreshUser();
        stage.innerHTML = `
            <div class="bez-kart-activation__result">
                <span class="bez-kart-activation__success" aria-hidden="true">✓</span>
                <h2 id="${DIALOG_ID}-title">Карта активирована!</h2>
                <a class="bez-kart-activation__submit" href="/">Подобрать тур</a>
            </div>`;
    } catch {
        stage.innerHTML = `
            <div class="bez-kart-activation__result">
                <h2 id="${DIALOG_ID}-title">Карта активирована!</h2>
                <p>Обновите страницу, чтобы увидеть данные карты.</p>
            </div>`;
    }
}

async function showExistingCard(): Promise<void> {
    const dialog = createDialog();
    dialog.querySelector('.bez-kart-activation__banner')?.remove();
    dialog.querySelector('.bez-kart-activation__steps')?.remove();
    const stage = dialog.querySelector<HTMLElement>('.bez-kart-activation__stage');
    if (stage) {
        stage.innerHTML = `
            <div class="bez-kart-activation__result">
                <span class="bez-kart-activation__success" aria-hidden="true">✓</span>
                <h2 id="${DIALOG_ID}-title">У вас уже есть карта CoralBonus</h2>
                <a class="bez-kart-activation__submit" href="/account/">Открыть личный кабинет</a>
            </div>`;
    }
    await openPopup(dialog);
}

export async function requestCardActivation(): Promise<void> {
    let profile = getProfile();
    if (!profile) {
        const loginButton = document.querySelector<HTMLElement>(LOGIN_BUTTON_SELECTOR);
        if (!loginButton) {
            console.error('CoralBonus: login button was not found');
            return;
        }
        loginButton.click();
        profile = await waitForLogin();
    }
    if (!profile) return;
    if (profile.BonusUserId) {
        await showExistingCard();
        return;
    }
    const dialog = createDialog();
    renderRegistration(dialog, profile);
    await openPopup(dialog);
}
