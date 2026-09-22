import type {UserProfile} from './profile';
import type {BonusProfile} from './customer-api';
import {ACTIVATION_DIALOG_ID} from './activation-view';
import {typographed} from '../../../shared/typography';

function assetUrl(path: string): string {
    return `${__PUBLIC_ASSETS_BASE__}/${path}`;
}

function appendCard(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    const card = stage.querySelector<HTMLElement>('.bez-kart-activation__card');
    if (!card) return;
    const level = Number(profile.BonusLevel);
    const cardType = bonus.cardType ?? 'Silver';
    const visual = [
        'card-ag-comp.webp',
        'card-au-comp.webp',
        'card-pt-comp.webp',
    ][Number.isInteger(level) && level >= 1 && level <= 3 ? level - 1 : Math.max(0, ['Silver', 'Gold', 'Platinum'].indexOf(cardType))];
    const image = document.createElement('img');
    image.src = assetUrl(visual);
    image.alt = `Карта CoralBonus ${cardType}`;
    const number = document.createElement('span');
    const digits = (bonus.cardNumber ?? '').replace(/\D/g, '');
    number.textContent = digits.match(/(\d{3})(\d{4})(\d{4})/)?.slice(1).join(' ') ?? '';
    card.append(image, number);
}

export function showSuccessResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${typographed`Карта активирована!`}</h2>
            <p>${typographed`Ваш уровень —`} <strong data-card-level></strong>, ${typographed`кешбэк`} <strong data-card-cashback></strong> ${typographed`с каждой покупки`}</p>
            <div class="bez-kart-activation__card"></div>
            <a class="bez-kart-activation__submit" href="/">${typographed`Подобрать тур`}</a>
        </div>`;
    const level = bonus.cardType ?? 'Silver';
    stage.querySelector<HTMLElement>('[data-card-level]')!.textContent = level;
    stage.querySelector<HTMLElement>('[data-card-cashback]')!.textContent = `${({Silver: 1, Gold: 2, Platinum: 3} as Record<string, number>)[level] ?? 1}%`;
    appendCard(stage, bonus, profile);
}

export function showRefreshRequiredResult(stage: HTMLElement): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('fail-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${typographed`Что-то пошло не так…`}</h2>
            <p>${typographed`Пожалуйста, попробуйте обновить страницу`}</p>
        </div>`;
}

export function showExistingCardResult(stage: HTMLElement, bonus: BonusProfile, profile: UserProfile): void {
    stage.innerHTML = `
        <div class="bez-kart-activation__result">
            <img class="bez-kart-activation__result-icon" src="${assetUrl('success-mark.svg')}" alt="">
            <h2 id="${ACTIVATION_DIALOG_ID}-title">${typographed`У вас уже есть карта CoralBonus`}</h2>
            <div class="bez-kart-activation__card"></div>
            <p>${typographed`Бонусы за поездки:`} <strong data-trip-balance></strong></p>
            <p>${typographed`Акционные бонусы:`} <strong data-promo-balance></strong></p>
        </div>`;
    stage.querySelector<HTMLElement>('[data-trip-balance]')!.textContent = String(bonus.accumulatedBalance ?? 0);
    stage.querySelector<HTMLElement>('[data-promo-balance]')!.textContent = String(bonus.promoBalance ?? 0);
    appendCard(stage, bonus, profile);
}
