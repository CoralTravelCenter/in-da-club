import {defineConfig} from 'vitest/config';

export default defineConfig({
    define: {
        __PUBLIC_ASSETS_BASE__: JSON.stringify('http://localhost:5173'),
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
