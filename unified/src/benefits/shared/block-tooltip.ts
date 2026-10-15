import {content as copy} from '@/content/content';
import type {TooltipContentItem} from '@/content/content.types';
import {registerCleanup} from '@/shared/runtime/dom-lifecycle';
import {addLockableTarget, disablePageScroll, enablePageScroll} from 'scroll-lock';

const TOOLTIP_ICON_URL = 'https://b2ccdn.coral.ru/content/info.svg';
const TOOLTIP_CLOSE_ICON_URL = 'https://b2ccdn.coral.ru/content/cross.svg';

export interface BlockTooltip {
    title: string;
    content: TooltipContentItem[];
}

let scrollLockInitialized = false;

function ensureScrollLockTarget(): void {
    if (scrollLockInitialized) return;

    addLockableTarget(document.documentElement);
    scrollLockInitialized = true;
}

export function createBlockTooltip(
    blockId: string,
    tooltip: BlockTooltip,
    block: HTMLElement,
    namespace: 'in-da-club-member' | 'in-da-club-prospect',
): {trigger: HTMLButtonElement; content: HTMLDivElement} {
    ensureScrollLockTarget();

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
        if (typeof line === 'string') {
            paragraph.textContent = line;
        } else {
            const label = document.createElement('strong');
            label.textContent = line.label;
            paragraph.append(label, document.createTextNode(`\u00a0${line.text}`));
        }
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

    const handleResize = (): void => {
        if (tooltipContent.matches(':popover-open')) positionContent();
    };
    window.addEventListener('resize', handleResize);
    registerCleanup(block, () => {
        window.removeEventListener('resize', handleResize);
        enablePageScroll(tooltipContent);
        block.closest<HTMLElement>(listClass)?.classList.remove(lockedListClass);
    });

    return {trigger, content: tooltipContent};
}
