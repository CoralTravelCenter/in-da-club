import type {ContentBlockConfig} from '../segments/segment.types';
import {typographText} from '../shared/typography';
import {addLockableTarget, disablePageScroll, enablePageScroll} from 'scroll-lock';
import {requestCardActivation} from '../card-activation/card-activation';

const TOOLTIP_ICON_URL = 'https://b2ccdn.coral.ru/content/info.svg';
const TOOLTIP_CLOSE_ICON_URL = 'https://b2ccdn.coral.ru/content/cross.svg';

addLockableTarget(document.documentElement);

function appendTextWithLineBreaks(element: HTMLElement, text: string): void {
    const lines = text.split(/(?:<br\s*\/?>|\r?\n)/gi);

    lines.forEach((line, index) => {
        if (index > 0) {
            element.append(document.createElement('br'));
        }

        element.append(document.createTextNode(typographText(line)));
    });
}

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
    const tooltipId = `bez-kart-tooltip-${config.id}`;
    const tooltipTitleId = `${tooltipId}-title`;

    trigger.className = 'bez-kart-tooltip-trigger';
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
    content.className = 'bez-kart-tooltip__content';
    content.setAttribute('popover', '');
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'false');
    content.setAttribute('aria-labelledby', tooltipTitleId);
    closeButton.className = 'bez-kart-tooltip__close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Закрыть подсказку');
    closeButton.setAttribute('popovertarget', tooltipId);
    closeButton.setAttribute('popovertargetaction', 'hide');
    closeIcon.src = TOOLTIP_CLOSE_ICON_URL;
    closeIcon.alt = '';
    closeIcon.width = 24;
    closeIcon.height = 24;
    closeButton.append(closeIcon);
    body.className = 'bez-kart-tooltip__body';
    title.className = 'bez-kart-tooltip__title';
    title.id = tooltipTitleId;
    title.textContent = typographText(config.tooltip?.title ?? '');
    text.className = 'bez-kart-tooltip__text';

    for (const line of config.tooltip?.content ?? []) {
        const paragraph = document.createElement('span');
        paragraph.textContent = typographText(line);
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
        const snapList = block.closest<HTMLElement>('.bez-kart-segment__list');

        if (content.matches(':popover-open')) {
            positionContent();
            trigger.setAttribute('aria-expanded', 'true');
            snapList?.classList.add('bez-kart-segment__list--scroll-locked');
            disablePageScroll(content);
            return;
        }

        enablePageScroll(content);
        snapList?.classList.remove('bez-kart-segment__list--scroll-locked');
        trigger.setAttribute('aria-expanded', 'false');
    });

    window.addEventListener('resize', () => {
        if (content.matches(':popover-open')) {
            positionContent();
        }
    });

    return {trigger, content};
}

export function renderBlock(config: ContentBlockConfig): HTMLElement {
    const block = document.createElement(config.href ? 'a' : 'article');
    block.className = 'bez-kart-block';
    block.dataset.blockId = config.id;

    if (block instanceof HTMLAnchorElement && config.href) {
        block.href = config.href;
    }

    if (config.media?.type === 'video') {
        const video = document.createElement('video');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        block.classList.add('bez-kart-block--video');
        video.className = 'bez-kart-block__video';
        video.src = config.media.src;
        video.autoplay = !reduceMotion;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.tabIndex = -1;
        video.setAttribute('aria-hidden', 'true');

        if (config.media.poster) {
            video.poster = config.media.poster;
        }

        block.append(video);
    }

    const content = document.createElement('div');
    content.className = 'bez-kart-block__content';

    if (config.badge) {
        const badge = document.createElement('span');
        badge.className = 'bez-kart-block__badge';
        badge.textContent = typographText(config.badge);
        content.append(badge);
    }

    const description = document.createElement('p');
    description.className = 'bez-kart-block__description';
    appendTextWithLineBreaks(description, config.description);

    if (config.title !== undefined) {
        const title = document.createElement('h3');
        title.className = 'bez-kart-block__title';
        title.textContent = typographText(config.title);
        content.append(title);
    } else {
        const value = document.createElement('span');
        const quantity = document.createElement('span');
        value.className = 'bez-kart-block__value';
        quantity.className = 'bez-kart-block__quantity';
        quantity.textContent = typographText(config.value);

        if (config.valuePrefix) {
            const prefix = document.createElement('span');
            prefix.className = 'bez-kart-block__value-prefix';
            prefix.textContent = typographText(config.valuePrefix);
            value.append(prefix);
        }

        value.append(quantity);
        content.append(value);
    }

    content.append(description);

    if (config.action && !(block instanceof HTMLAnchorElement)) {
        const button = document.createElement('coral-button');
        button.className = 'bez-kart-block__action';
        button.setAttribute('trait', 'vivid');
        button.setAttribute('shape', 'pill');

        const link = document.createElement('button');
        link.type = 'button';
        link.textContent = typographText(config.action.label);
        link.addEventListener('click', () => {
            void requestCardActivation();
        });

        button.append(link);
        content.append(button);
    }

    if (config.tooltip) {
        const tooltip = createTooltip(config, block);

        content.append(tooltip.trigger);
        block.append(content, tooltip.content);
    } else {
        block.append(content);
    }
    return block;
}
