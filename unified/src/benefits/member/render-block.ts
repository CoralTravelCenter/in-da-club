import type {ContentBlockConfig} from '@/segmentation/member.types';
import {applyBlockBackground} from '@/benefits/shared/block-background';
import {createBlockTooltip} from '@/benefits/shared/block-tooltip';
import {DESKTOP_MEDIA_QUERY} from '@/shared/runtime/media';
import {appendTextWithBreaks} from '@/shared/runtime/text';

function createSkeleton(part: 'name' | 'value' | 'badge' | 'image' | 'card'): HTMLSpanElement {
    const skeleton = document.createElement('span');
    skeleton.className = `in-da-club-member-block__skeleton in-da-club-member-block__skeleton--${part}`;
    skeleton.setAttribute('aria-hidden', 'true');
    return skeleton;
}

export function renderBlock(config: ContentBlockConfig): HTMLElement {
    const block = document.createElement('article');
    const content = document.createElement('div');
    block.className = 'in-da-club-member-block';
    block.dataset.blockId = config.id;
    content.className = 'in-da-club-member-block__content';
    if (config.isLoading === 'card') {
        block.classList.add('in-da-club-member-block--loading', 'in-da-club-member-block--card-loading');
        block.setAttribute('aria-busy', 'true');
        content.append(createSkeleton('card'));
        block.append(content);
        return block;
    }
    applyBlockBackground(block, config.presentation.background);
    if (config.isLoading) {
        block.classList.add('in-da-club-member-block--loading');
        block.setAttribute('aria-busy', 'true');
    }
    if (config.badge) {
        const badge = document.createElement('span');
        badge.className = 'in-da-club-member-block__badge';
        block.dataset.cardLevel = config.badge.toLowerCase();
        if (config.isLoading && config.id === 'card-level') {
            badge.classList.add('in-da-club-member-block__skeleton', 'in-da-club-member-block__skeleton--badge');
            badge.setAttribute('aria-hidden', 'true');
        } else {
            badge.textContent = config.badge;
        }
        content.append(badge);
    }
    if (config.title) {
        const title = document.createElement('h3');
        title.className = 'in-da-club-member-block__title';
        const appendAccent = (): void => {
            if (config.isLoading && config.id === 'greeting') {
                title.append(createSkeleton('name'));
                return;
            }
            if (!config.titleAccent) return;
            const accent = document.createElement('span');
            accent.className = 'in-da-club-member-block__title-accent';
            accent.textContent = config.titleAccent;
            title.append(accent);
        };
        if (!config.titleAccentAfter) appendAccent();
        appendTextWithBreaks(title, config.title);
        if (config.titleAccentAfter) appendAccent();
        content.append(title);
    } else if (config.value) {
        const value = document.createElement('span');
        value.className = 'in-da-club-member-block__value';
        if (config.isLoading && config.id === 'cashback') {
            value.classList.add('in-da-club-member-block__skeleton', 'in-da-club-member-block__skeleton--value');
            value.setAttribute('aria-hidden', 'true');
        } else {
            const quantity = document.createElement('span');
            quantity.className = 'in-da-club-member-block__quantity';
            if (config.valuePrefix) {
                const prefix = document.createElement('span');
                prefix.className = 'in-da-club-member-block__value-prefix';
                prefix.textContent = config.valuePrefix;
                value.append(prefix);
            }
            quantity.textContent = config.value;
            value.append(quantity);
        }
        content.append(value);
    }
    if (config.description) {
        const description = document.createElement('p');
        description.className = 'in-da-club-member-block__description';
        appendTextWithBreaks(description, config.description);
        if (config.descriptionAccent) {
            const accent = document.createElement('span');
            accent.className = 'in-da-club-member-block__description-accent';
            accent.textContent = config.descriptionAccent;
            description.append(accent);
        }
        if (config.descriptionStrong) {
            const strong = document.createElement('strong');
            strong.textContent = config.descriptionStrong;
            description.append(document.createTextNode('\u00a0'), strong);
        }
        if (config.descriptionSuffix) {
            description.append(document.createTextNode(config.descriptionSuffix));
        }
        content.append(description);
    }
    if (config.image) {
        if (config.isLoading && config.id === 'card-level') {
            content.append(createSkeleton('image'));
        } else {
            const picture = document.createElement('picture');
            const image = document.createElement('img');
            picture.className = 'in-da-club-member-block__image-container';
            image.className = 'in-da-club-member-block__image';
            image.src = config.image.src;
            image.alt = config.image.alt;
            if (config.image.desktopSrc) {
                const source = document.createElement('source');
                source.media = DESKTOP_MEDIA_QUERY;
                source.srcset = config.image.desktopSrc;
                picture.append(source);
            }
            picture.append(image);
            content.append(picture);
        }
    }
    if (config.action) {
        const action = document.createElement('coral-button');
        const link = document.createElement('a');
        action.className = 'in-da-club-member-block__action';
        action.setAttribute('trait', 'vivid');
        action.setAttribute('shape', 'pill');
        link.href = config.action.href;
        link.textContent = config.action.label;
        if (config.action.target) {
            link.target = config.action.target;
            link.rel = 'noopener';
        }
        action.append(link);
        content.append(action);
    }
    const tooltip = config.tooltip
        ? createBlockTooltip(config.id, config.tooltip, block, 'in-da-club-member')
        : null;
    if (tooltip) content.append(tooltip.trigger);
    block.append(content);
    if (tooltip) block.append(tooltip.content);
    return block;
}
