import {renderSegment} from '@/benefits/member/render-segment';
import {getSegmentConfig} from '@/segmentation/member-config';
import type {CustomerContext} from '@/segmentation/member.types';
import {typographed} from '@/shared/runtime/typography';

export function renderUnifiedShell(container: HTMLElement): HTMLElement {
    const title = document.createElement('h2');
    const content = document.createElement('div');

    title.className = 'unified-title';
    title.textContent = typographed`Клуб «Море возможностей»`;
    content.className = 'unified-content';
    container.replaceChildren(title, content);

    return content;
}

function appendTextWithBreaks(element: HTMLElement, text: string): void {
    text.split(/<br\s*\/?>/i).forEach((part, index) => {
        if (index > 0) element.append(document.createElement('br'));
        element.append(document.createTextNode(part));
    });
}

export function renderLoadingState(container: HTMLElement, customer: CustomerContext): void {
    const config = getSegmentConfig('inactive', customer);
    container.replaceChildren(renderSegment({
        ...config,
        ariaLabel: 'Загрузка преимуществ клуба',
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
    appendTextWithBreaks(title, 'Не удалось загрузить данные клуба');
    description.className = 'unified-error__description';
    appendTextWithBreaks(description, 'Попробуйте ещё раз.<br> Если ошибка повторится, обновите страницу позже.');
    action.className = 'unified-error__action';
    action.setAttribute('trait', 'vivid');
    action.setAttribute('shape', 'pill');
    button.type = 'button';
    button.textContent = 'Повторить';
    button.addEventListener('click', retry);

    action.append(button);
    card.append(title, description, action);
    section.append(card);
    container.replaceChildren(section);
}
