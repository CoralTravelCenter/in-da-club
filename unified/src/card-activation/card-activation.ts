import {getBonusProfile} from './api/customer-api';
import {getProfile, waitForLogin, type UserProfile} from './model/profile';
import {content} from '@/content/content';
import {textToSafeHtml} from '@/shared/runtime/text';
import {
    createDialog,
    type CoralPopupElement,
} from './ui/activation-view';
import {showExistingCardResult, showRefreshRequiredResult} from './ui/activation-result-view';
import {renderRegistration} from './registration-flow';

const LOGIN_BUTTON_SELECTOR = '[class*="LoginButton_loginButton"]';
let activeDialog: CoralPopupElement | null = null;

async function openPopup(popup: CoralPopupElement): Promise<void> {
    await customElements.whenDefined('coral-popup');
    await popup.show();
}

function rememberFirstStepHeight(dialog: CoralPopupElement): void {
    const stage = dialog.querySelector<HTMLElement>('.in-da-club-activation__stage');
    if (!stage) return;
    const height = Math.ceil(Math.max(stage.getBoundingClientRect().height, stage.scrollHeight));
    if (height > 0) dialog.style.setProperty('--in-da-club-activation-step-height', `${height}px`);
}

async function showExistingCard(profile: UserProfile): Promise<void> {
    const dialog = createDialog();
    activeDialog = dialog;
    dialog.setAttribute('aria-label', content.activation.dialog.existingCard);
    dialog.querySelector('.in-da-club-activation__body')?.classList.add('in-da-club-activation__body--single');
    dialog.querySelector('.in-da-club-activation__banner')?.remove();
    dialog.querySelector('.in-da-club-activation__steps')?.remove();
    const stage = dialog.querySelector<HTMLElement>('.in-da-club-activation__stage');
    if (stage) {
        stage.innerHTML = `<div class="in-da-club-activation__status" role="status">${textToSafeHtml(content.activation.dialog.loadingCard)}</div>`;
    }
    await openPopup(dialog);
    if (stage) {
        try {
            showExistingCardResult(stage, await getBonusProfile(), profile);
        } catch {
            showRefreshRequiredResult(stage);
        }
    }
}

let activationPending = false;

export async function requestCardActivation(promo = ''): Promise<void> {
    if (activationPending) return;
    activationPending = true;
    try {
        if (activeDialog?.isConnected) {
            await openPopup(activeDialog);
            return;
        }

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
            await showExistingCard(profile);
            return;
        }
        const dialog = createDialog();
        activeDialog = dialog;
        renderRegistration(dialog, profile, promo);
        await openPopup(dialog);
        rememberFirstStepHeight(dialog);
    } catch (error) {
        activeDialog?.remove();
        activeDialog = null;
        console.error('CoralBonus: failed to open card activation', error);
    } finally {
        activationPending = false;
    }
}
