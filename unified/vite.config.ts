import {createViteConfig} from '../vite.config.base.ts';

const BUILD_MODES = ['unified'] as const;

export default createViteConfig({
    appName: 'in-da-club',
    configUrl: import.meta.url,
    segmentIds: BUILD_MODES,
    defaultSegment: 'unified',
    devPort: 5175,
    productionAssetsBase: 'https://b2ccdn.coral.ru/content/in-da-club',
});
