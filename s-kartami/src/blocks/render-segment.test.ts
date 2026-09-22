// @vitest-environment jsdom
import {describe, expect, it} from 'vitest';
import type {BlockPresentation, SegmentConfig} from '@/segments/segment.types';
import {renderSegment} from './render-segment';

function presentation(mobile: BlockPresentation['placement']['mobile']): BlockPresentation {
    return {
        placement: {
            mobile,
            desktop: {column: '1', row: '1'},
        },
    };
}

describe('renderSegment', () => {
    it('выносит видеоблок из мобильного слайдера', () => {
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: () => ({matches: false}),
        });
        const config: SegmentConfig = {
            id: 'inactive',
            ariaLabel: 'Клубные преимущества',
            blocks: [
                {
                    id: 'greeting',
                    title: 'Добро пожаловать',
                    description: '',
                    media: {type: 'video', src: '/club.webm'},
                    presentation: presentation('featured'),
                },
                {id: 'card-level', badge: 'Silver', description: 'Уровень карты', presentation: presentation('featured')},
                {id: 'cashback', value: '3%', description: 'Кешбэк', presentation: presentation('list')},
            ],
        };

        const segment = renderSegment(config);

        expect(segment.dataset.client).toBe('inactive');
        expect(segment.dataset.ride).toBe('0');
        expect(segment.querySelector('.s-kartami-segment__featured')?.getAttribute('data-block-id')).toBe('greeting');
        expect(segment.querySelector('.s-kartami-segment__featured--card-level')?.getAttribute('data-block-id')).toBe('card-level');
        expect(segment.querySelector('.s-kartami-segment__list [data-block-id="greeting"]')).toBeNull();
        expect(segment.querySelector('.s-kartami-segment__list [data-block-id="card-level"]')).toBeNull();
        expect(segment.querySelector('.s-kartami-segment__list [data-block-id="cashback"]')).not.toBeNull();
    });

    it('добавляет признаки активного клиента и количества поездок', () => {
        const segment = renderSegment({
            id: 'one-trip',
            ariaLabel: 'Клубные преимущества',
            blocks: [
                {id: 'birthday-bonus', value: '10 000', description: 'Бонусов', presentation: presentation('list')},
                {id: 'greeting', title: 'Добро пожаловать', description: '', presentation: presentation('featured')},
                {id: 'card-level', badge: 'Silver', description: 'Уровень карты', presentation: presentation('featured')},
                {id: 'travel-more', title: 'Путешествуйте больше', description: '', presentation: presentation('list')},
            ],
        });

        expect(segment.dataset.client).toBe('active');
        expect(segment.dataset.ride).toBe('1');
        expect(segment.querySelector('.s-kartami-segment__featured[data-block-id="greeting"]')).not.toBeNull();
        expect(segment.querySelector('.s-kartami-segment__featured--card-level[data-block-id="card-level"]')).not.toBeNull();
        expect(segment.querySelector('.s-kartami-segment__list [data-block-id="greeting"]')).toBeNull();
        expect(segment.querySelector('.s-kartami-segment__list [data-block-id="card-level"]')).toBeNull();
        expect(segment.querySelectorAll('.s-kartami-segment__list > li')).toHaveLength(2);
    });
});
