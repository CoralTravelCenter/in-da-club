import type {SegmentConfig} from '@/segmentation/prospect.types';
import {typographed} from '@/shared/runtime/typography';
import { renderBlock } from './render-block';

export function renderSegment(
  config: SegmentConfig,
  onActivateCard: () => void | Promise<void>,
  showTitle = true,
): HTMLElement {
  const container = document.createElement('section');
  const titleId = `no-card-title-${config.id}`;
  container.className = 'in-da-club-prospect-segment';
  container.dataset.segmentId = config.id;
  container.setAttribute('aria-label', config.ariaLabel);

  const title = document.createElement('h2');
  title.id = titleId;
  title.className = 'in-da-club-prospect-segment__title';
  title.textContent = typographed`Клуб «Море возможностей»`;

  const content = document.createElement('div');
  content.className = 'in-da-club-prospect-segment__content';

  const list = document.createElement('ul');
  list.className = 'in-da-club-prospect-segment__list';
  list.setAttribute('aria-label', typographed`Другие преимущества клуба`);
  list.setAttribute('role', 'list');

  for (const blockConfig of config.blocks) {
    const {placement} = blockConfig.presentation;
    const setDesktopPlacement = (element: HTMLElement): void => {
      element.style.setProperty('--block-grid-column', placement.desktop.column);
      element.style.setProperty('--block-grid-row', placement.desktop.row);
    };

    if (placement.mobile === 'featured') {
      const featured = document.createElement('div');
      featured.className = 'in-da-club-prospect-segment__featured';
      featured.dataset.blockId = blockConfig.id;
      setDesktopPlacement(featured);
      featured.append(renderBlock(blockConfig, onActivateCard));
      content.append(featured);
      continue;
    }

    const item = document.createElement('li');
    item.className = 'in-da-club-prospect-segment__item';
    item.dataset.blockId = blockConfig.id;
    setDesktopPlacement(item);
    item.append(renderBlock(blockConfig, onActivateCard));
    list.append(item);
  }

  content.append(list);
  if (showTitle) container.append(title);
  container.append(content);

  return container;
}
