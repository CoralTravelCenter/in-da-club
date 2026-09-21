import {createViteConfig} from '../shared/vite-config.ts';
import {SEGMENT_IDS} from './src/segments/segment.types.ts';

export default createViteConfig({
    appName: 'bez-kart',
    configUrl: import.meta.url,
    segmentIds: SEGMENT_IDS,
    defaultSegment: 'new-client',
    devPort: 5173,
    productionAssetsBase: 'https://b2ccdn.coral.ru/content/in-da-club/bez-kart',
});
