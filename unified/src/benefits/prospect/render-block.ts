import type {ContentBlockConfig} from '@/segmentation/prospect.types';
import {applyBlockBackground} from '@/benefits/shared/block-background';
import {createBlockTooltip} from '@/benefits/shared/block-tooltip';
import {appendTextWithBreaks} from '@/shared/runtime/text';

function appendBadge(content: HTMLElement, badge: string): void {
    const element = document.createElement('span');
    element.className = 'in-da-club-prospect-block__badge';
    element.textContent = badge;
    content.append(element);
}

function appendHeadingOrValue(content: HTMLElement, config: ContentBlockConfig): void {
    if (config.title !== undefined) {
        const title = document.createElement('h3');
        title.className = 'in-da-club-prospect-block__title';
        title.textContent = config.title;
        content.append(title);
        return;
    }

    const value = document.createElement('span');
    const quantity = document.createElement('span');
    value.className = 'in-da-club-prospect-block__value';
    quantity.className = 'in-da-club-prospect-block__quantity';
    quantity.textContent = config.value;

    if (config.valuePrefix) {
        const prefix = document.createElement('span');
        prefix.className = 'in-da-club-prospect-block__value-prefix';
        prefix.textContent = config.valuePrefix;
        value.append(prefix);
    }

    value.append(quantity);
    content.append(value);
}

function appendDescription(content: HTMLElement, description: string): void {
    const element = document.createElement('p');
    element.className = 'in-da-club-prospect-block__description';
    appendTextWithBreaks(element, description);
    content.append(element);
}

function appendAction(
    content: HTMLElement,
    action: NonNullable<ContentBlockConfig['action']>,
    onActivateCard: (promo?: string) => void | Promise<void>,
): void {
    const button = document.createElement('coral-button');
    button.className = 'in-da-club-prospect-block__action';
    button.setAttribute('trait', 'vivid');
    button.setAttribute('shape', 'pill');

    const link = document.createElement('button');
    link.textContent = action.label;
    link.type = 'button';
    link.addEventListener('click', () => {
        void onActivateCard(action.promo);
    });

    button.append(link);
    content.append(button);
}

function wrapContentInLink(content: HTMLElement, href: string): void {
    const link = document.createElement('a');
    link.className = 'in-da-club-prospect-block__link';
    link.href = href;
    link.append(...Array.from(content.childNodes));
    content.append(link);
}

export function renderBlock(
    config: ContentBlockConfig,
    onActivateCard: (promo?: string) => void | Promise<void>,
): HTMLElement {
    const block = document.createElement(config.href && !config.tooltip ? 'a' : 'article');
    block.className = 'in-da-club-prospect-block';
    block.dataset.blockId = config.id;

    applyBlockBackground(block, config.presentation.background);

    if (block instanceof HTMLAnchorElement && config.href) {
        block.href = config.href;
    }

    const content = document.createElement('div');
    content.className = 'in-da-club-prospect-block__content';

    if (config.badge) {
        appendBadge(content, config.badge);
    }

    appendHeadingOrValue(content, config);

    if (config.description) {
        appendDescription(content, config.description);
    }

    if (config.action && !config.href) {
        appendAction(content, config.action, onActivateCard);
    }

    if (config.href && config.tooltip) {
        wrapContentInLink(content, config.href);
    }

    if (config.tooltip) {
        const tooltip = createBlockTooltip(config.id, config.tooltip, block, 'in-da-club-prospect');

        content.append(tooltip.trigger);
        block.append(content, tooltip.content);
    } else {
        block.append(content);
    }
    return block;
}
