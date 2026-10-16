export function createSegmentPagination(list: HTMLUListElement, namespace: string): HTMLElement {
  const pagination = document.createElement('div');
  const items = [...list.children] as HTMLLIElement[];
  const dots = items.map(() => {
    const dot = document.createElement('span');
    dot.className = `${namespace}-segment__pagination-dot`;
    dot.setAttribute('aria-hidden', 'true');
    pagination.append(dot);
    return dot;
  });
  let activeIndex = -1;
  const updatePagination = (): void => {
    const firstOffset = items[0]?.offsetLeft ?? 0;
    const nextIndex = items.reduce((closestIndex, item, index) => {
      const currentDistance = Math.abs(items[closestIndex].offsetLeft - firstOffset - list.scrollLeft);
      const nextDistance = Math.abs(item.offsetLeft - firstOffset - list.scrollLeft);
      return nextDistance < currentDistance ? index : closestIndex;
    }, 0);
    if (nextIndex === activeIndex) return;
    dots[activeIndex]?.classList.remove(`${namespace}-segment__pagination-dot--active`);
    dots[nextIndex]?.classList.add(`${namespace}-segment__pagination-dot--active`);
    pagination.setAttribute('aria-label', `Карточка ${nextIndex + 1} из ${items.length}`);
    activeIndex = nextIndex;
  };

  pagination.className = `${namespace}-segment__pagination`;
  pagination.setAttribute('role', 'img');
  list.addEventListener('scroll', updatePagination, {passive: true});
  updatePagination();
  return pagination;
}
