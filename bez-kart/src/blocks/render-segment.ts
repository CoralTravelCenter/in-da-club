import type { SegmentConfig } from '../segments/segment.types';
import {typographed} from '../../../shared/runtime/typography';
import { renderBlock } from './render-block';

export function renderSegment(
  config: SegmentConfig,
  onActivateCard: () => void | Promise<void>,
): HTMLElement {
  const container = document.createElement('section');
  const titleId = `bez-kart-title-${config.id}`;
  container.className = 'bez-kart-segment';
  container.dataset.segmentId = config.id;
  container.setAttribute('aria-label', config.ariaLabel);

  const title = document.createElement('h2');
  title.id = titleId;
  title.className = 'bez-kart-segment__title';
  title.textContent = typographed`Клуб «Море возможностей»`;

  const content = document.createElement('div');
  content.className = 'bez-kart-segment__content';

  const list = document.createElement('ul');
  list.className = 'bez-kart-segment__list';
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
      featured.className = 'bez-kart-segment__featured';
      featured.dataset.blockId = blockConfig.id;
      setDesktopPlacement(featured);
      featured.append(renderBlock(blockConfig, onActivateCard));
      content.append(featured);
      continue;
    }

    const item = document.createElement('li');
    item.className = 'bez-kart-segment__item';
    item.dataset.blockId = blockConfig.id;
    setDesktopPlacement(item);
    item.append(renderBlock(blockConfig, onActivateCard));
    list.append(item);
  }

  content.append(list);
  container.append(title, content);

  return container;
}
