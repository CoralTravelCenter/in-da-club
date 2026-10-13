const LINE_BREAK_PATTERN = /(?:<br\s*\/?>|\r?\n)/gi;

export function appendTextWithBreaks(element: HTMLElement, text: string): void {
    text.split(LINE_BREAK_PATTERN).forEach((part, index) => {
        if (index > 0) element.append(document.createElement('br'));
        element.append(document.createTextNode(part));
    });
}

export function textToSafeHtml(text: string): string {
    return text
        .split(LINE_BREAK_PATTERN)
        .map((part) => part
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;'))
        .join('<br>');
}
