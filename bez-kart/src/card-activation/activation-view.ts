import {typographed} from '../../../shared/typography';

export interface CoralPopupElement extends HTMLElement {
    show: () => Promise<void> | void;
    hide: () => void;
}

export const ACTIVATION_DIALOG_ID = 'bez-kart-card-activation';

export function setStep(dialog: CoralPopupElement, step: number): void {
    const steps = dialog.querySelector<HTMLElement>('.bez-kart-activation__steps');
    steps?.setAttribute('aria-label', `Шаг ${step + 1} из 3`);
    dialog.querySelectorAll<HTMLElement>('[data-step-mark]').forEach((mark, index) => {
        mark.dataset.state = index < step ? 'complete' : index === step ? 'current' : 'upcoming';
        if (index === step) mark.setAttribute('aria-current', 'step');
        else mark.removeAttribute('aria-current');
    });
}

export function showMessage(container: HTMLElement, message: string): void {
    let error = container.querySelector<HTMLElement>('.bez-kart-activation__error');
    if (!error) {
        error = document.createElement('p');
        error.className = 'bez-kart-activation__error';
        error.setAttribute('role', 'alert');
        container.append(error);
    }
    error.textContent = message;
}

export function createDialog(): CoralPopupElement {
    document.getElementById(ACTIVATION_DIALOG_ID)?.remove();
    const dialog = document.createElement('coral-popup') as CoralPopupElement;
    dialog.id = ACTIVATION_DIALOG_ID;
    dialog.className = 'bez-kart-activation';
    dialog.setAttribute('aria-label', typographed`Оформление карты`);
    dialog.innerHTML = `
        <coral-button class="bez-kart-activation__close" trait="pale" shape="pill" size="small">
            <button type="button" style="position: absolute; z-index: 1; top: calc(-31px - 8px); right: 0;">${typographed`Закрыть`}</button>
        </coral-button>
        <div class="bez-kart-activation__body">
            <div class="bez-kart-activation__banner" aria-hidden="true"></div>
            <div class="bez-kart-activation__panel">
                <div class="bez-kart-activation__steps" role="group" aria-label="${typographed`Шаг 1 из 3`}">
                    <span data-step-mark data-state="current" aria-current="step">1</span><i></i>
                    <span data-step-mark data-state="upcoming">2</span><i></i>
                    <span data-step-mark data-state="upcoming">3</span>
                </div>
                <div class="bez-kart-activation__stage"></div>
            </div>
        </div>`;

    dialog.querySelector<HTMLButtonElement>('.bez-kart-activation__close button')?.addEventListener('click', () => dialog.hide());
    document.body.append(dialog);
    return dialog;
}
