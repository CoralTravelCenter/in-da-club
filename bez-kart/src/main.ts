import { bootstrap } from './app/bootstrap';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

function mount(): boolean {
  const container = document.querySelector(ROOT_SELECTOR);

  if (!(container instanceof HTMLElement)) {
    return false;
  }

  bootstrap({
    container,
    segmentId: __MINDBOX_SEGMENT__,
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
