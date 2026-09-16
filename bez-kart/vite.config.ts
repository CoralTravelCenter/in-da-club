import {defineConfig} from 'vite';
import monkey from 'vite-plugin-monkey';

const segmentIds = ['new-client', 'regular-1', 'regular-2', 'regular-3'] as const;

function isSegmentId(value: string): value is (typeof segmentIds)[number] {
    return (segmentIds as readonly string[]).includes(value);
}

export default defineConfig(({mode}) => {
    const segmentId = isSegmentId(mode) ? mode : 'new-client';

    return {
        define: {
            __MINDBOX_SEGMENT__: JSON.stringify(segmentId),
        },
        server: {
            cors: true,
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
        },
        plugins: [
            monkey({
                entry: 'src/main.ts',
                userscript: {
                    name: `bez-kart: ${segmentId}`,
                    namespace: 'npm/vite-plugin-monkey',
                    match: ['https://www.coral.ru/*'],
                },
            }),
        ],
        build: {
            minify: true,
            outDir: `dist/${segmentId}`,
        },
    };
});
