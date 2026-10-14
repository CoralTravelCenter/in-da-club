// @vitest-environment jsdom

import {describe, expect, it} from 'vitest';
import {renderUnifiedShell} from './render-state';

describe('renderUnifiedShell', () => {
    it('делает заголовок ссылкой на страницу клуба', () => {
        const container = document.createElement('div');

        renderUnifiedShell(container);

        const section = container.querySelector<HTMLElement>('section.corallium');
        const link = container.querySelector<HTMLAnchorElement>('.corallium__title-link');
        expect(section?.querySelector(':scope > h2')).not.toBeNull();
        expect(section?.querySelector('.unified-content')).not.toBeNull();
        expect(link?.textContent).toBe('Клуб «Море возможностей»');
        expect(link?.getAttribute('href')).toBe('/coralbonus/club/');
        expect(link?.target).toBe('_blank');
        expect(link?.rel).toBe('noopener');
    });
});
