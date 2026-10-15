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
            __V2_ASSETS_BASE__: JSON.stringify('http://localhost:5175/v2'),
        },
        test: {
            environment: 'node',
            include: ['src/**/*.test.ts'],
        },
    });
}
