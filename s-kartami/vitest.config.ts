import {defineConfig} from 'vitest/config';
import {fileURLToPath, URL} from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    define: {
        __PUBLIC_ASSETS_BASE__: JSON.stringify('http://localhost:5173'),
    },
    test: {
        environment: 'node',
        include: ['src/blocks/**/*.test.ts', 'src/segments/**/*.test.ts'],
    },
});
