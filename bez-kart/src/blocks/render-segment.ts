import type { SegmentConfig } from '../segments/segment.types';
import { typographText } from '../shared/typography';
import { renderBlock } from './render-block';

export function renderSegment(
  config: SegmentConfig,
  onActivateCard: () => void | Promise<void>,
): HTMLElement {
  const container = document.createElement('section');
  const titleId = `bez-kart-title-${config.id}`;
  container.className = 'bez-kart-segment';
  container.dataset.segmentId = config.id;
  container.setAttribute('aria-label', typographText(config.ariaLabel));

  const title = document.createElement('h2');
  title.id = titleId;
  title.className = 'bez-kart-segment__title';
  title.textContent = typographText('Клуб «Море возможностей»');

  const content = document.createElement('div');
  content.className = 'bez-kart-segment__content';

  const list = document.createElement('ul');
  list.className = 'bez-kart-segment__list';
  list.setAttribute('aria-label', typographText('Другие преимущества клуба'));
  list.setAttribute('role', 'list');

  for (const blockConfig of config.blocks) {
    if (blockConfig.id === 'club') {
      const featured = document.createElement('div');
      featured.className = 'bez-kart-segment__featured';
      featured.dataset.blockId = blockConfig.id;
      featured.append(renderBlock(blockConfig, onActivateCard));
      content.append(featured);
      continue;
    }

    const item = document.createElement('li');
    item.className = 'bez-kart-segment__item';
    item.dataset.blockId = blockConfig.id;
    item.append(renderBlock(blockConfig, onActivateCard));
    list.append(item);
  }

  content.append(list);
  container.append(title, content);

  return container;
}
