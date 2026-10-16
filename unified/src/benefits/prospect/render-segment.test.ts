// @vitest-environment jsdom

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getSegmentConfig} from '@/segmentation/prospect-config';
import {renderSegment} from './render-segment';

describe('renderSegment', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  it('renders and updates the mobile carousel pagination', () => {
    const segment = renderSegment(getSegmentConfig('new-client'), vi.fn());
    const list = segment.querySelector<HTMLElement>('.in-da-club-prospect-segment__list');
    const items = [...segment.querySelectorAll<HTMLElement>('.in-da-club-prospect-segment__item')];
    const pagination = segment.querySelector('.in-da-club-prospect-segment__pagination');
    const dots = [...segment.querySelectorAll('.in-da-club-prospect-segment__pagination-dot')];
    items.forEach((item, index) => vi.spyOn(item, 'offsetLeft', 'get').mockReturnValue(index * 200));

    expect(dots).toHaveLength(items.length);
    expect(pagination?.getAttribute('aria-label')).toBe(`Карточка 1 из ${items.length}`);
    expect(dots[0].classList.contains('in-da-club-prospect-segment__pagination-dot--active')).toBe(true);

    if (!list) throw new Error('Не найден список карточек');
    list.scrollLeft = 200;
    list.dispatchEvent(new Event('scroll'));

    expect(pagination?.getAttribute('aria-label')).toBe(`Карточка 2 из ${items.length}`);
    expect(dots[1].classList.contains('in-da-club-prospect-segment__pagination-dot--active')).toBe(true);
  });
});
