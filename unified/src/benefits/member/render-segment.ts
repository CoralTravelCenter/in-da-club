import type {SegmentConfig} from '@/segmentation/member.types';
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
    container.className = 'in-da-club-member-segment';
    container.dataset.segmentId = config.id;
    container.dataset.client = config.id === 'inactive' ? 'inactive' : 'active';
    container.dataset.ride = String(RIDE_COUNT[config.id]);
    container.setAttribute('aria-label', config.ariaLabel);
    content.className = 'in-da-club-member-segment__content';
    const list = document.createElement('ul');
    list.className = 'in-da-club-member-segment__list';
    list.setAttribute('role', 'list');
    for (const blockConfig of config.blocks) {
        const {placement} = blockConfig.presentation;
        if (placement.mobile === 'featured') {
            const featured = document.createElement('div');
            featured.className = 'in-da-club-member-segment__featured';
            if (blockConfig.id === 'card-level') {
                featured.classList.add('in-da-club-member-segment__featured--card-level');
            }
            featured.dataset.blockId = blockConfig.id;
            featured.append(renderBlock(blockConfig));
            content.append(featured);
            continue;
        }

        const item = document.createElement('li');
        item.className = 'in-da-club-member-segment__item';
        item.dataset.blockId = blockConfig.id;
        item.append(renderBlock(blockConfig));
        list.append(item);
    }
    content.append(list);
    container.append(content);
    return container;
}
