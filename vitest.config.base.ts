import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vitest/config';

export function createVitestConfig(appName: string, configUrl: string) {
    return defineConfig({
        root: fileURLToPath(new URL('.', configUrl)),
        cacheDir: fileURLToPath(new URL(`../node_modules/.vite/${appName}`, configUrl)),
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', configUrl)),
            },
        },
        define: {
            __PUBLIC_ASSETS_BASE__: JSON.stringify('http://localhost:5173'),
            __BEZ_KART_ASSETS_BASE__: JSON.stringify('http://localhost:5173'),
            __S_KARTAMI_ASSETS_BASE__: JSON.stringify('http://localhost:5174'),
        },
        test: {
            environment: 'node',
            include: ['src/**/*.test.ts'],
        },
    });
}
