import type {BonusProfile} from '../api/customer-api';
import type {UserProfile} from '../model/profile';
import {ACTIVATION_DIALOG_ID} from './activation-view';
import {content} from '@/content/content';
import {textToSafeHtml} from '@/shared/runtime/text';

function assetUrl(path: string): string {
    return `${__NO_CARD_ASSETS_BASE__}/${path}`;
}

function cardAssetUrl(path: string): string {
    return `${__SHARED_ASSETS_BASE__}/${path}`;
}

function appendCard(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    const card = stage.querySelector<HTMLElement>('.in-da-club-activation__card');
    if (!card) return;
    const level = Number(profile.BonusLevel);
    const cardType = bonus.cardType ?? 'Silver';
    const visual = [
        'card-ag-comp.webp',
        'card-au-comp.webp',
        'card-pt-comp.webp',
    ][Number.isInteger(level) && level >= 1 && level <= 3 ? level - 1 : Math.max(0, ['Silver', 'Gold', 'Platinum'].indexOf(cardType))];
    const image = document.createElement('img');
    image.src = cardAssetUrl(visual);
    image.alt = `${content.activation.result.cardAlt} ${cardType}`;
    const number = document.createElement('span');
    const digits = (bonus.cardNumber ?? '').replace(/\D/g, '');
    number.textContent = digits.match(/(\d{3})(\d{4})(\d{4})/)?.slice(1).join(' ') ?? '';
    card.append(image, number);
}

export function showSuccessResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="in-da-club-activation__result">
            <img class="in-da-club-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${textToSafeHtml(content.activation.result.successTitle)}</h2>
            <p>${textToSafeHtml(content.activation.result.levelPrefix)} <strong data-card-level></strong>, ${textToSafeHtml(content.activation.result.cashback)} <strong data-card-cashback></strong> ${textToSafeHtml(content.activation.result.cashbackSuffix)}</p>
            <div class="in-da-club-activation__card"></div>
            <a class="in-da-club-activation__submit" href="${textToSafeHtml(content.activation.links.tours)}">${textToSafeHtml(content.activation.result.chooseTour)}</a>
        </div>`;
    const level = bonus.cardType ?? 'Silver';
    stage.querySelector<HTMLElement>('[data-card-level]')!.textContent = level;
    stage.querySelector<HTMLElement>('[data-card-cashback]')!.textContent = `${({Silver: 1, Gold: 2, Platinum: 3} as Record<string, number>)[level] ?? 1}%`;
    appendCard(stage, bonus, profile);
}

export function showRefreshRequiredResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="in-da-club-activation__result">
            <img class="in-da-club-activation__result-icon" src="${assetUrl('fail-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${textToSafeHtml(content.activation.result.failureTitle)}</h2>
            <p>${textToSafeHtml(content.activation.result.failureDescription)}</p>
        </div>`;
}

export function showExistingCardResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="in-da-club-activation__result">
            <img class="in-da-club-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${textToSafeHtml(content.activation.result.existingCardTitle)}</h2>
            <div class="in-da-club-activation__card"></div>
            <p>${textToSafeHtml(content.activation.result.tripBalance)} <strong data-trip-balance></strong></p>
            <p>${textToSafeHtml(content.activation.result.promoBalance)} <strong data-promo-balance></strong></p>
        </div>`;
    stage.querySelector<HTMLElement>('[data-trip-balance]')!.textContent = String(bonus.accumulatedBalance ?? 0);
    stage.querySelector<HTMLElement>('[data-promo-balance]')!.textContent = String(bonus.promoBalance ?? 0);
    appendCard(stage, bonus, profile);
}
