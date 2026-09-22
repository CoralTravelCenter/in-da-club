import type {SegmentConfig} from '@/segments/segment.types';
import {renderBlock} from './render-block';

const RIDE_COUNT: Record<SegmentConfig['id'], number> = {
    inactive: 0,
    'one-trip': 1,
    'two-trips': 2,
    'three-plus': 3,
};

export function renderSegment(config: SegmentConfig): HTMLElement {
    const container = document.createElement('section');
    const content = document.createElement('div');
    container.className = 's-kartami-segment';
    container.dataset.segmentId = config.id;
    container.dataset.client = config.id === 'inactive' ? 'inactive' : 'active';
    container.dataset.ride = String(RIDE_COUNT[config.id]);
    container.setAttribute('aria-label', config.ariaLabel);
    content.className = 's-kartami-segment__content';
    const list = document.createElement('ul');
    list.className = 's-kartami-segment__list';
    list.setAttribute('role', 'list');
    for (const blockConfig of config.blocks) {
        const {placement} = blockConfig.presentation;
        const setDesktopPlacement = (element: HTMLElement): void => {
            element.style.setProperty('--block-grid-column', placement.desktop.column);
            element.style.setProperty('--block-grid-row', placement.desktop.row);
        };
        if (placement.mobile === 'featured') {
            const featured = document.createElement('div');
            featured.className = 's-kartami-segment__featured';
            if (blockConfig.id === 'card-level') {
                featured.classList.add('s-kartami-segment__featured--card-level');
            }
            featured.dataset.blockId = blockConfig.id;
            setDesktopPlacement(featured);
            featured.append(renderBlock(blockConfig));
            content.append(featured);
            continue;
        }

        const item = document.createElement('li');
        item.className = 's-kartami-segment__item';
        item.dataset.blockId = blockConfig.id;
        setDesktopPlacement(item);
        item.append(renderBlock(blockConfig));
        list.append(item);
    }
    content.append(list);
    container.append(content);
    return container;
}
