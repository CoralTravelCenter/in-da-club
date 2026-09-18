// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ContentBlockConfig} from '../segments/segment.types';
import {renderBlock} from './render-block';

describe('renderBlock', () => {
    beforeEach(() => {
        document.body.replaceChildren();
        vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: false}));
    });

    afterEach(() => vi.unstubAllGlobals());

    it('создаёт ссылку с заголовком и переносами в описании', () => {
        const config: ContentBlockConfig = {
            id: 'manager',
            title: 'Личный менеджер',
            description: 'Первая строка<br>Вторая строка',
            href: '/account/',
        };

        const block = renderBlock(config, vi.fn());

        expect(block).toBeInstanceOf(HTMLAnchorElement);
        expect((block as HTMLAnchorElement).getAttribute('href')).toBe('/account/');
        expect(block.querySelectorAll('a')).toHaveLength(0);
        expect(block.querySelector('.bez-kart-block__title')?.textContent).toContain('Личный менеджер');
        expect(block.querySelector('.bez-kart-block__description')?.innerHTML).toContain('<br>');
    });

    it('создаёт кнопку действия и вызывает переданный обработчик', () => {
        const onActivateCard = vi.fn();
        const config: ContentBlockConfig = {
            id: 'club',
            value: '5000',
            valuePrefix: 'до',
            description: 'Баллы',
            action: {type: 'activate-card', label: 'Оформить карту'},
        };

        const block = renderBlock(config, onActivateCard);
        const button = block.querySelector<HTMLButtonElement>('button');
        button?.click();

        expect(block.tagName).toBe('ARTICLE');
        expect(block.querySelector('.bez-kart-block__value-prefix')?.textContent).toContain('до');
        expect(onActivateCard).toHaveBeenCalledOnce();
    });

    it('оставляет кнопку подсказки вне ссылки', () => {
        const config: ContentBlockConfig = {
            id: 'cashback',
            title: 'Кешбэк',
            description: 'Описание',
            href: '/bonus/',
            tooltip: {title: 'Подробнее', content: ['Условие']},
        };

        const block = renderBlock(config, vi.fn());

        expect(block.tagName).toBe('ARTICLE');
        expect(block.querySelector('.bez-kart-block__link')).toBeTruthy();
        expect(block.querySelector('.bez-kart-block__link button')).toBeNull();
        expect(block.querySelector('.bez-kart-tooltip-trigger')).toBeTruthy();
        expect(block.querySelector('[role="dialog"]')).toBeTruthy();
    });

    it('отключает автозапуск видео при запросе уменьшенного движения', () => {
        vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}));
        const config: ContentBlockConfig = {
            id: 'club',
            title: 'Клуб',
            description: 'Описание',
            media: {type: 'video', src: '/club.mp4', poster: '/poster.jpg'},
        };

        const video = renderBlock(config, vi.fn()).querySelector('video');

        expect(video?.autoplay).toBe(false);
        expect(video?.muted).toBe(true);
        expect(video?.getAttribute('poster')).toBe('/poster.jpg');
    });

    it('использует MOV в Safari и WebM в остальных браузерах', () => {
        const config: ContentBlockConfig = {
            id: 'club',
            title: 'Клуб',
            description: 'Описание',
            media: {type: 'video', src: '/club.webm', safariSrc: '/club.mov'},
        };

        vi.stubGlobal('navigator', {userAgent: 'Mozilla/5.0 Version/18.0 Safari/605.1.15'});
        const safariVideo = renderBlock(config, vi.fn()).querySelector('video');
        expect(safariVideo?.getAttribute('src')).toBe('/club.mov');

        vi.stubGlobal('navigator', {userAgent: 'Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36'});
        const chromeVideo = renderBlock(config, vi.fn()).querySelector('video');
        expect(chromeVideo?.getAttribute('src')).toBe('/club.webm');
    });
});
