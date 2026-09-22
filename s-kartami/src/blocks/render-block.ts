import type {ContentBlockConfig} from '@/segments/segment.types';
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
    const tooltipId = `s-kartami-tooltip-${config.id}`;
    const tooltipTitleId = `${tooltipId}-title`;

    trigger.className = 's-kartami-tooltip-trigger';
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
    content.className = 's-kartami-tooltip__content';
    content.setAttribute('popover', '');
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'false');
    content.setAttribute('aria-labelledby', tooltipTitleId);
    closeButton.className = 's-kartami-tooltip__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Закрыть подсказку');
    closeButton.setAttribute('popovertarget', tooltipId);
    closeButton.setAttribute('popovertargetaction', 'hide');
    closeIcon.src = TOOLTIP_CLOSE_ICON_URL;
    closeIcon.alt = '';
    closeIcon.width = 24;
    closeIcon.height = 24;
    closeButton.append(closeIcon);
    body.className = 's-kartami-tooltip__body';
    title.className = 's-kartami-tooltip__title';
    title.id = tooltipTitleId;
    title.textContent = config.tooltip?.title ?? '';
    text.className = 's-kartami-tooltip__text';

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
        const snapList = block.closest<HTMLElement>('.s-kartami-segment__list');

        if (content.matches(':popover-open')) {
            positionContent();
            trigger.setAttribute('aria-expanded', 'true');
            snapList?.classList.add('s-kartami-segment__list--scroll-locked');
            disablePageScroll(content);
            return;
        }

        enablePageScroll(content);
        snapList?.classList.remove('s-kartami-segment__list--scroll-locked');
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

    block.classList.add('s-kartami-block--video');
    video.className = 's-kartami-block__video';
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

export function renderBlock(config: ContentBlockConfig): HTMLElement {
    const block = document.createElement('article');
    const content = document.createElement('div');
    block.className = 's-kartami-block';
    block.dataset.blockId = config.id;
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
    content.className = 's-kartami-block__content';
    if (config.isLoading) {
        const heading = document.createElement('span');
        const text = document.createElement('span');
        block.classList.add('s-kartami-block--loading');
        block.setAttribute('aria-busy', 'true');
        heading.className = 's-kartami-block__skeleton s-kartami-block__skeleton--heading';
        text.className = 's-kartami-block__skeleton s-kartami-block__skeleton--text';
        content.append(heading, text);
        block.append(content);
        return block;
    }
    if (config.media?.type === 'video') appendVideo(block, config.media);
    if (config.badge) {
        const badge = document.createElement('span');
        badge.className = 's-kartami-block__badge';
        badge.textContent = config.badge;
        block.dataset.cardLevel = config.badge.toLowerCase();
        content.append(badge);
    }
    if (config.title) {
        const title = document.createElement('h3');
        title.className = 's-kartami-block__title';
        const appendAccent = (): void => {
            if (!config.titleAccent) return;
            const accent = document.createElement('span');
            accent.className = 's-kartami-block__title-accent';
            accent.textContent = config.titleAccent;
            title.append(accent);
        };
        if (!config.titleAccentAfter) appendAccent();
        appendTextWithBreaks(title, config.title);
        if (config.titleAccentAfter) appendAccent();
        content.append(title);
    } else if (config.value) {
        const value = document.createElement('span');
        const quantity = document.createElement('span');
        value.className = 's-kartami-block__value';
        quantity.className = 's-kartami-block__quantity';
        quantity.textContent = config.value;
        if (config.valuePrefix) {
            const prefix = document.createElement('span');
            prefix.className = 's-kartami-block__value-prefix';
            prefix.textContent = config.valuePrefix;
            value.append(prefix);
        }
        value.append(quantity);
        content.append(value);
    }
    if (config.description) {
        const description = document.createElement('p');
        description.className = 's-kartami-block__description';
        appendTextWithBreaks(description, config.description);
        content.append(description);
    }
    if (config.image) {
        const image = document.createElement('img');
        image.className = 's-kartami-block__image';
        image.src = config.image.src;
        image.alt = config.image.alt;
        content.append(image);
    }
    if (config.action) {
        const action = document.createElement('coral-button');
        const link = document.createElement('a');
        action.className = 's-kartami-block__action';
        action.setAttribute('trait', 'vivid');
        action.setAttribute('shape', 'pill');
        link.href = config.action.href;
        link.textContent = config.action.label;
        action.append(link);
        content.append(action);
    }
    const tooltip = config.tooltip ? createTooltip(config, block) : null;
    if (tooltip) content.append(tooltip.trigger);
    block.append(content);
    if (tooltip) block.append(tooltip.content);
    return block;
}
