import {renderSegment} from '@/benefits/member/render-segment';
import {content as copy} from '@/content/content';
import {getSegmentConfig} from '@/segmentation/member-config';
import type {CustomerContext} from '@/segmentation/member.types';
import {appendTextWithBreaks} from '@/shared/runtime/text';
import {replaceChildrenWithCleanup} from '@/shared/runtime/dom-lifecycle';

export function renderUnifiedShell(container: HTMLElement): HTMLElement {
    const section = document.createElement('section');
    const title = document.createElement('div');
    const heading = document.createElement('h2');
    const titleLink = document.createElement('a');
    const content = document.createElement('div');

    container.dataset.inDaClubRoot = '';

    section.className = 'coral-custom-section';

    titleLink.className = 'corallium__title-link';
    titleLink.href = copy.common.links.club;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener';
    titleLink.textContent = copy.common.clubTitle;

    title.className = 'coral-custom-section__headline';
    heading.append(titleLink);
    title.append(heading);

    content.className = 'unified-content';

    section.append(title, content);
    replaceChildrenWithCleanup(container, section);

    return content;
}

export function renderLoadingState(container: HTMLElement, customer: CustomerContext): void {
    const config = getSegmentConfig('inactive', customer);
    replaceChildrenWithCleanup(container, renderSegment({
        ...config,
        ariaLabel: copy.common.loading.benefitsLabel,
        blocks: config.blocks.map((block) => ({...block, isLoading: 'card'})),
    }));
}

export function renderErrorState(container: HTMLElement, retry: () => void): void {
    const section = document.createElement('section');
    const card = document.createElement('article');
    const title = document.createElement('h2');
    const description = document.createElement('p');
    const action = document.createElement('coral-button');
    const button = document.createElement('button');

    section.className = 'unified-error';
    section.setAttribute('aria-labelledby', 'unified-error-title');
    card.className = 'unified-error__card';
    card.setAttribute('role', 'alert');
    title.id = 'unified-error-title';
    title.className = 'unified-error__title';
    appendTextWithBreaks(title, copy.common.error.title);
    description.className = 'unified-error__description';
    appendTextWithBreaks(description, copy.common.error.description);
    action.className = 'unified-error__action';
    action.setAttribute('trait', 'vivid');
    action.setAttribute('shape', 'pill');
    button.type = 'button';
    button.textContent = copy.common.error.retry;
    button.addEventListener('click', retry);

    action.append(button);
    card.append(title, description, action);
    section.append(card);
    replaceChildrenWithCleanup(container, section);
}
