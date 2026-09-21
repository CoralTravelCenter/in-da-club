import { bootstrap } from './app/bootstrap';
import { SEGMENT_IDS } from './segments/segment.types';
import { mountWhenAvailable } from '../../shared/mount-when-available';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

mountWhenAvailable({
  selector: ROOT_SELECTOR,
  start: (container) => {
    const clientGroup = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('cb_client') : null;
    const segmentId = clientGroup !== null && /^[0-3]$/.test(clientGroup)
      ? SEGMENT_IDS[Number(clientGroup)]
      : __MINDBOX_SEGMENT__;

    bootstrap({
      container,
      segmentId,
    });
  },
});
