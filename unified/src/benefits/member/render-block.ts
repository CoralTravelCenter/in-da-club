import type {ContentBlockConfig} from '@/segmentation/member.types';
import {addLockableTarget, disablePageScroll, enablePageScroll} from 'scroll-lock';

const TOOLTIP_ICON_URL = 'https://b2ccdn.coral.ru/content/info.svg';
const TOOLTIP_CLOSE_ICON_URL = 'https://b2ccdn.coral.ru/content/cross.svg';

addLockableTarget(document.documentElement);

function createTooltip(config: ContentBlockConfig, block: HTMLElement): {
    trigger: HTMLButtonElement;
    content: HTMLDivElement;
} {
    const trigger = document.createElement('button');
    const triggerIcon = document.createElement('img');
    const content = document.createElement('div');
    const closeButton = document.createElement('button');
    const closeIcon = document.createElement('img');
    const body = document.createElement('div');
    const title = document.createElement('strong');
    const text = document.createElement('div');
    const tooltipId = `in-da-club-member-tooltip-${config.id}`;
    const tooltipTitleId = `${tooltipId}-title`;

    trigger.className = 'in-da-club-member-tooltip-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'Показать дополнительную информацию');
    trigger.setAttribute('aria-controls', tooltipId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('popovertarget', tooltipId);
    triggerIcon.src = TOOLTIP_ICON_URL;
    triggerIcon.alt = '';
    triggerIcon.width = 24;
    triggerIcon.height = 24;
    trigger.append(triggerIcon);

    content.id = tooltipId;
    content.className = 'in-da-club-member-tooltip__content';
    content.setAttribute('popover', '');
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'false');
    content.setAttribute('aria-labelledby', tooltipTitleId);
    closeButton.className = 'in-da-club-member-tooltip__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Закрыть подсказку');
    closeButton.setAttribute('popovertarget', tooltipId);
    closeButton.setAttribute('popovertargetaction', 'hide');
    closeIcon.src = TOOLTIP_CLOSE_ICON_URL;
    closeIcon.alt = '';
    closeIcon.width = 24;
    closeIcon.height = 24;
    closeButton.append(closeIcon);
    body.className = 'in-da-club-member-tooltip__body';
    title.className = 'in-da-club-member-tooltip__title';
    title.id = tooltipTitleId;
    title.textContent = config.tooltip?.title ?? '';
    text.className = 'in-da-club-member-tooltip__text';

    for (const line of config.tooltip?.content ?? []) {
        const paragraph = document.createElement('span');
        paragraph.textContent = line;
        text.append(paragraph);
    }

    text.prepend(title);
    body.append(text);
    content.append(closeButton, body);

    const positionContent = (): void => {
        const blockRect = block.getBoundingClientRect();
        const availableHeight = Math.max(
            Math.min(blockRect.bottom, window.innerHeight) - 16,
            0,
        );

        content.style.width = `${blockRect.width}px`;
        content.style.left = `${blockRect.left}px`;
        content.style.bottom = `${window.innerHeight - blockRect.bottom}px`;
        content.style.maxHeight = `${availableHeight}px`;
    };

    content.addEventListener('toggle', () => {
        const snapList = block.closest<HTMLElement>('.in-da-club-member-segment__list');

        if (content.matches(':popover-open')) {
            positionContent();
            trigger.setAttribute('aria-expanded', 'true');
            snapList?.classList.add('in-da-club-member-segment__list--scroll-locked');
            disablePageScroll(content);
            return;
        }

        enablePageScroll(content);
        snapList?.classList.remove('in-da-club-member-segment__list--scroll-locked');
        trigger.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('resize', () => {
        if (content.matches(':popover-open')) {
            positionContent();
        }
    });

    return {trigger, content};
}

function appendVideo(block: HTMLElement, media: NonNullable<ContentBlockConfig['media']>): void {
    const video = document.createElement('video');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSafari = /safari/i.test(navigator.userAgent)
        && !/(chrome|chromium|crios|android|edg|opr|fxios)/i.test(navigator.userAgent);

    block.classList.add('in-da-club-member-block--video');
    video.className = `in-da-club-member-block__video in-da-club-member-block__video--${media.variant}`;
    video.src = isSafari ? media.safariSrc ?? media.src : media.src;
    video.autoplay = !reduceMotion;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.tabIndex = -1;
    video.setAttribute('aria-hidden', 'true');
    if (media.poster) video.poster = media.poster;
    block.append(video);
}

function appendTextWithBreaks(element: HTMLElement, text: string): void {
    text.split(/<br\s*\/?>/i).forEach((part, index) => {
        if (index > 0) element.append(document.createElement('br'));
        element.append(document.createTextNode(part));
    });
}

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
    if (config.presentation.background) {
        const {mobile, desktop = mobile} = config.presentation.background;
        block.dataset.hasBackground = '';
        block.style.setProperty('--block-background-mobile', `url("${mobile.src}")`);
        block.style.setProperty('--block-background-size-mobile', mobile.size);
        block.style.setProperty('--block-background-position-mobile', mobile.position);
        block.style.setProperty('--block-background-desktop', `url("${desktop.src}")`);
        block.style.setProperty('--block-background-size-desktop', desktop.size);
        block.style.setProperty('--block-background-position-desktop', desktop.position);
    }
    if (config.isLoading) {
        block.classList.add('in-da-club-member-block--loading');
        block.setAttribute('aria-busy', 'true');
    }
    if (config.media?.type === 'video') appendVideo(block, config.media);
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
            if (config.valuePrefix) value.classList.add('in-da-club-member-block__skeleton--value-wide');
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
            const image = document.createElement('img');
            image.className = 'in-da-club-member-block__image';
            image.src = config.image.src;
            image.alt = config.image.alt;
            content.append(image);
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
    const tooltip = config.tooltip ? createTooltip(config, block) : null;
    if (tooltip) content.append(tooltip.trigger);
    block.append(content);
    if (tooltip) block.append(tooltip.content);
    return block;
}
