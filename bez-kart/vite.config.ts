import {defineConfig, type Plugin} from 'vite';
import monkey from 'vite-plugin-monkey';

const segmentIds = ['new-client', 'regular-1', 'regular-2', 'regular-3'] as const;
const DEV_ASSETS_BASE = 'http://localhost:5173';
const PRODUCTION_ASSETS_BASE = 'https://b2ccdn.coral.ru/content/in-da-club/bez-kart';

function isSegmentId(value: string): value is (typeof segmentIds)[number] {
    return (segmentIds as readonly string[]).includes(value);
}

function htmlBuildOutput(): Plugin {
    return {
        name: 'bez-kart:html-build-output',
        enforce: 'post',
        generateBundle: {
            order: 'post',
            handler(_options, bundle) {
                const entry = Object.entries(bundle).find(([fileName]) => fileName.endsWith('.user.js'));
                if (!entry) throw new Error('Не найден собранный userscript для HTML-обёртки');

                const [fileName, output] = entry;
                if (output.type !== 'chunk') throw new Error('Userscript собран не как JavaScript chunk');

                delete bundle[fileName];
                this.emitFile({
                    type: 'asset',
                    fileName: 'bez-kart.html',
                    source: `<script>\n${output.code.trim()}\n</script>\n`,
                });
            },
        },
    };
}

export default defineConfig(({command, mode}) => {
    const segmentId = isSegmentId(mode) ? mode : 'new-client';
    const publicAssetsBase = command === 'serve' ? DEV_ASSETS_BASE : PRODUCTION_ASSETS_BASE;

    return {
        define: {
            __MINDBOX_SEGMENT__: JSON.stringify(segmentId),
            __PUBLIC_ASSETS_BASE__: JSON.stringify(publicAssetsBase),
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use 'abstracts/config' with ($public-assets-base: '${publicAssetsBase}');\n`,
                },
            },
        },
        server: {
            cors: true,
            host: '127.0.0.1',
            open: '/__vite-plugin-monkey.install.user.js',
            port: 5173,
            strictPort: true,
        },
        plugins: [
            monkey({
                entry: 'src/main.ts',
                generate: ({userscript, mode}) => mode === 'build' ? '' : userscript,
                userscript: {
                    name: `bez-kart: ${segmentId}`,
                    namespace: 'npm/vite-plugin-monkey',
                    match: ['https://www.coral.ru/*'],
                },
                build: {
                    fileName: 'bez-kart.user.js',
                },
            }),
            htmlBuildOutput(),
        ],
        build: {
            copyPublicDir: false,
            minify: true,
            outDir: `dist/${segmentId}`,
        },
    };
});
