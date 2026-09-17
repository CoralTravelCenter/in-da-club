import { bootstrap } from './app/bootstrap';
import { SEGMENT_IDS } from './segments/segment.types';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

function mount(): boolean {
  const container = document.querySelector(ROOT_SELECTOR);

  if (!(container instanceof HTMLElement)) {
    return false;
  }

  const clientGroup = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('cb_client') : null;
  const segmentId = clientGroup !== null && /^[0-3]$/.test(clientGroup)
    ? SEGMENT_IDS[Number(clientGroup)]
    : __MINDBOX_SEGMENT__;

  bootstrap({
    container,
    segmentId,
  });

  return true;
}

if (!mount()) {
  const observer = new MutationObserver(() => {
    if (mount()) {
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
