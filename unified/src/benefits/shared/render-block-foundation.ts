import {content as copy} from '@/content/content';
import {addLockableTarget, disablePageScroll, enablePageScroll} from 'scroll-lock';

const TOOLTIP_ICON_URL = 'https://b2ccdn.coral.ru/content/info.svg';
const TOOLTIP_CLOSE_ICON_URL = 'https://b2ccdn.coral.ru/content/cross.svg';

addLockableTarget(document.documentElement);

export interface BlockBackground {
    mobile: {src: string; size: string; position: string};
    desktop?: {src: string; size: string; position: string};
}

export interface BlockTooltip {
    title: string;
    content: string[];
}

export interface BlockVideo {
    src: string;
    safariSrc?: string;
    poster?: string;
}

export function applyBlockBackground(block: HTMLElement, background?: BlockBackground): void {
    if (!background) return;

    const {mobile, desktop = mobile} = background;
    block.dataset.hasBackground = '';
    block.style.setProperty('--block-background-mobile', `url("${mobile.src}")`);
    block.style.setProperty('--block-background-size-mobile', mobile.size);
    block.style.setProperty('--block-background-position-mobile', mobile.position);
    block.style.setProperty('--block-background-desktop', `url("${desktop.src}")`);
    block.style.setProperty('--block-background-size-desktop', desktop.size);
    block.style.setProperty('--block-background-position-desktop', desktop.position);
}

export function appendBlockVideo(
    block: HTMLElement,
    media: BlockVideo,
    blockClass: string,
    videoClass: string,
): void {
    const video = document.createElement('video');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSafari = /safari/i.test(navigator.userAgent)
        && !/(chrome|chromium|crios|android|edg|opr|fxios)/i.test(navigator.userAgent);

    block.classList.add(blockClass);
    video.className = videoClass;
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

export function createBlockTooltip(
    blockId: string,
    tooltip: BlockTooltip,
    block: HTMLElement,
    namespace: 'in-da-club-member' | 'in-da-club-prospect',
): {trigger: HTMLButtonElement; content: HTMLDivElement} {
    const trigger = document.createElement('button');
    const triggerIcon = document.createElement('img');
    const tooltipContent = document.createElement('div');
    const closeButton = document.createElement('button');
    const closeIcon = document.createElement('img');
    const body = document.createElement('div');
    const title = document.createElement('strong');
    const text = document.createElement('div');
    const tooltipId = `${namespace}-tooltip-${blockId}`;
    const tooltipTitleId = `${tooltipId}-title`;
    const listClass = `.${namespace}-segment__list`;
    const lockedListClass = `${namespace}-segment__list--scroll-locked`;

    trigger.className = `${namespace}-tooltip-trigger`;
    trigger.type = 'button';
    trigger.setAttribute('aria-label', copy.common.tooltip.openLabel);
    trigger.setAttribute('aria-controls', tooltipId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('popovertarget', tooltipId);
    triggerIcon.src = TOOLTIP_ICON_URL;
    triggerIcon.alt = '';
    triggerIcon.width = 24;
    triggerIcon.height = 24;
    trigger.append(triggerIcon);

    tooltipContent.id = tooltipId;
    tooltipContent.className = `${namespace}-tooltip__content`;
    tooltipContent.setAttribute('popover', '');
    tooltipContent.setAttribute('role', 'dialog');
    tooltipContent.setAttribute('aria-modal', 'false');
    tooltipContent.setAttribute('aria-labelledby', tooltipTitleId);
    closeButton.className = `${namespace}-tooltip__close`;
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', copy.common.tooltip.closeLabel);
    closeButton.setAttribute('popovertarget', tooltipId);
    closeButton.setAttribute('popovertargetaction', 'hide');
    closeIcon.src = TOOLTIP_CLOSE_ICON_URL;
    closeIcon.alt = '';
    closeIcon.width = 24;
    closeIcon.height = 24;
    closeButton.append(closeIcon);
    body.className = `${namespace}-tooltip__body`;
    title.className = `${namespace}-tooltip__title`;
    title.id = tooltipTitleId;
    title.textContent = tooltip.title;
    text.className = `${namespace}-tooltip__text`;

    for (const line of tooltip.content) {
        const paragraph = document.createElement('span');
        paragraph.textContent = line;
        text.append(paragraph);
    }

    text.prepend(title);
    body.append(text);
    tooltipContent.append(closeButton, body);

    const positionContent = (): void => {
        const blockRect = block.getBoundingClientRect();
        const availableHeight = Math.max(Math.min(blockRect.bottom, window.innerHeight) - 16, 0);

        tooltipContent.style.width = `${blockRect.width}px`;
        tooltipContent.style.left = `${blockRect.left}px`;
        tooltipContent.style.bottom = `${window.innerHeight - blockRect.bottom}px`;
        tooltipContent.style.maxHeight = `${availableHeight}px`;
    };

    tooltipContent.addEventListener('toggle', () => {
        const snapList = block.closest<HTMLElement>(listClass);

        if (tooltipContent.matches(':popover-open')) {
            positionContent();
            trigger.setAttribute('aria-expanded', 'true');
            snapList?.classList.add(lockedListClass);
            disablePageScroll(tooltipContent);
            return;
        }

        enablePageScroll(tooltipContent);
        snapList?.classList.remove(lockedListClass);
        trigger.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('resize', () => {
        if (tooltipContent.matches(':popover-open')) positionContent();
    });

    return {trigger, content: tooltipContent};
}
