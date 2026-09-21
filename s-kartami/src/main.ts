import { bootstrap } from './app/bootstrap';
import { SEGMENT_IDS } from './segments/segment.types';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

function mount(): boolean {
  const container = document.querySelector(ROOT_SELECTOR);

  if (!(container instanceof HTMLElement)) {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const rideCount = import.meta.env.DEV
    ? searchParams.get('ride') ?? searchParams.get('cb_client')
    : null;
  const segmentId = rideCount !== null && /^[0-3]$/.test(rideCount)
    ? SEGMENT_IDS[Number(rideCount)]
    : __MINDBOX_SEGMENT__;

  void bootstrap({
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
