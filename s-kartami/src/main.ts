import { bootstrap } from './app/bootstrap';
import {normalizeCardLevel} from './segments/bonus-profile';
import { SEGMENT_IDS } from './segments/segment.types';
import { mountWhenAvailable } from '../../shared/runtime/mount-when-available';
import './styles/main.scss';

const ROOT_SELECTOR = '[data-bez-kart-root]';

mountWhenAvailable({
  selector: ROOT_SELECTOR,
  start: async (container) => {
    const searchParams = new URLSearchParams(window.location.search);
    const rideCount = import.meta.env.DEV
      ? searchParams.get('ride') ?? searchParams.get('cb_client')
      : null;
    const segmentId = rideCount !== null && /^[0-3]$/.test(rideCount)
      ? SEGMENT_IDS[Number(rideCount)]
      : __MINDBOX_SEGMENT__;
    const cardLevelOverride = import.meta.env.DEV
      ? normalizeCardLevel(searchParams.get('card')) ?? undefined
      : undefined;

    await bootstrap({
      container,
      segmentId,
      cardLevelOverride,
    });
  },
});
