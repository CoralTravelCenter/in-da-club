import type {SegmentConfig} from '@/segmentation/prospect.types';
import {content as copy} from '@/content/content';
import {registerCleanup} from '@/shared/runtime/dom-lifecycle';
import {renderBlock} from './render-block';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

export function renderSegment(
  config: SegmentConfig,
  onActivateCard: (promo?: string) => void | Promise<void>,
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
  title.textContent = copy.prospect.segmentTitle;

  const content = document.createElement('div');
  content.className = 'in-da-club-prospect-segment__content';

  const mobileList = document.createElement('ul');
  mobileList.className = 'in-da-club-prospect-segment__list';
  mobileList.setAttribute('aria-label', copy.prospect.otherBenefitsLabel);

  const desktopLayout = document.createElement('div');
  desktopLayout.className = 'in-da-club-prospect-segment__desktop-layout';

  const desktopColumns = new Map<string, {column: HTMLDivElement; list: HTMLUListElement}>();
  for (const columnNumber of ['1', '2', '3']) {
    const column = document.createElement('div');
    const columnList = document.createElement('ul');
    column.className = 'in-da-club-prospect-segment__column';
    column.dataset.column = columnNumber;
    columnList.className = 'in-da-club-prospect-segment__column-list';
    column.append(columnList);
    desktopLayout.append(column);
    desktopColumns.set(columnNumber, {column, list: columnList});
  }

  const renderedBlocks = new Map<string, HTMLElement>();
  let featured: HTMLElement | undefined;

  for (const blockConfig of config.blocks) {
    if (blockConfig.presentation.mobilePlacement === 'featured') {
      featured = document.createElement('div');
      featured.className = 'in-da-club-prospect-segment__featured';
      featured.dataset.blockId = blockConfig.id;
      featured.append(renderBlock(blockConfig, onActivateCard));
      renderedBlocks.set(blockConfig.id, featured);
      continue;
    }

    const item = document.createElement('li');
    item.className = 'in-da-club-prospect-segment__item';
    item.dataset.blockId = blockConfig.id;
    item.append(renderBlock(blockConfig, onActivateCard));
    renderedBlocks.set(blockConfig.id, item);
  }

  const syncLayout = (isDesktop: boolean): void => {
    if (isDesktop) {
      for (const blockConfig of config.blocks) {
        const wrapper = renderedBlocks.get(blockConfig.id);
        const target = desktopColumns.get(blockConfig.presentation.desktopColumn);
        if (!wrapper || !target) continue;

        if (blockConfig.presentation.mobilePlacement === 'featured') {
          target.column.prepend(wrapper);
        } else {
          target.list.append(wrapper);
        }
      }

      content.replaceChildren(desktopLayout);
      return;
    }

    mobileList.replaceChildren(...config.blocks
      .filter(({presentation}) => presentation.mobilePlacement === 'list')
      .map(({id}) => renderedBlocks.get(id))
      .filter((element): element is HTMLElement => element !== undefined));
    content.replaceChildren(...featured ? [featured, mobileList] : [mobileList]);
  };

  const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);
  const handleLayoutChange = (event: MediaQueryListEvent): void => syncLayout(event.matches);
  syncLayout(desktopMedia.matches);
  desktopMedia.addEventListener?.('change', handleLayoutChange);
  registerCleanup(container, () => desktopMedia.removeEventListener?.('change', handleLayoutChange));

  if (showTitle) container.append(title);
  container.append(content);

  return container;
}
