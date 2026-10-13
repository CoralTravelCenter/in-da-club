// @vitest-environment jsdom

import {describe, expect, it} from 'vitest';
import {appendTextWithBreaks, textToSafeHtml} from './text';

describe('appendTextWithBreaks', () => {
    it('поддерживает явные переносы строк', () => {
        const element = document.createElement('p');

        appendTextWithBreaks(element, 'Первая строка<br>Вторая\nТретья');

        expect(element.innerHTML).toBe('Первая строка<br>Вторая<br>Третья');
    });

    it('не интерпретирует произвольный HTML', () => {
        const element = document.createElement('p');

        appendTextWithBreaks(element, '<strong>Текст</strong><br><script>bad()</script>');

        expect(element.querySelector('strong')).toBeNull();
        expect(element.querySelector('script')).toBeNull();
        expect(element.textContent).toBe('<strong>Текст</strong><script>bad()</script>');
    });

    it('безопасно подготавливает текст для статического HTML-шаблона', () => {
        expect(textToSafeHtml('Первая<br><script>bad()</script>'))
            .toBe('Первая<br>&lt;script&gt;bad()&lt;/script&gt;');
    });
});
