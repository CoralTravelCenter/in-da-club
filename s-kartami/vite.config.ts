import {createViteConfig} from '../shared/vite-config.ts';
import {SEGMENT_IDS} from './src/segments/segment.types.ts';

export default createViteConfig({
    appName: 's-kartami',
    configUrl: import.meta.url,
    segmentIds: SEGMENT_IDS,
    defaultSegment: 'inactive',
    devPort: 5174,
    productionAssetsBase: 'https://b2ccdn.coral.ru/content/in-da-club/s-kartami',
});
