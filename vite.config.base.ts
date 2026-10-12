import {fileURLToPath, URL} from 'node:url';
import {defineConfig, type Plugin} from 'vite';
import monkey from 'vite-plugin-monkey';

function htmlBuildOutput(appName: string): Plugin {
    return {
        name: `${appName}:html-build-output`,
        enforce: 'post',
        generateBundle: {
            order: 'post',
            handler(_options, bundle) {
                const entry = Object.entries(bundle).find(([fileName]) => fileName.endsWith('.user.js'));
                if (!entry) throw new Error('Не найден собранный userscript для HTML-обёртки');

                const [fileName, output] = entry;
                if (output.type !== 'chunk') throw new Error('Userscript собран не как JavaScript chunk');

                delete bundle[fileName];
                const script = output.code.trim()
                    .replaceAll('«', '\\u00AB')
                    .replaceAll('»', '\\u00BB');
                this.emitFile({
                    type: 'asset',
                    fileName: `${appName}.html`,
                    source: `<script>\n${script}\n</script>\n`,
                });
            },
        },
    };
}

interface ViteConfigOptions<SegmentId extends string> {
    appName: string;
    configUrl: string;
    segmentIds: readonly SegmentId[];
    defaultSegment: SegmentId;
    devPort: number;
    productionAssetsBase: string;
    outputDir?: string;
}

const PRODUCTION_ASSETS_BASE = {
    noCard: 'https://b2ccdn.coral.ru/content/in-da-club/bez-kart',
    cardholder: 'https://b2ccdn.coral.ru/content/in-da-club/s-kartami',
} as const;

export function createViteConfig<const SegmentId extends string>({
    appName,
    configUrl,
    segmentIds,
    defaultSegment,
    devPort,
    productionAssetsBase,
    outputDir,
}: ViteConfigOptions<SegmentId>) {
    const projectRoot = fileURLToPath(new URL('.', configUrl));
    const cacheDir = fileURLToPath(new URL(`../node_modules/.vite/${appName}`, configUrl));
    const sharedStylesDir = fileURLToPath(new URL('./src/shared/styles', configUrl));
    const devAssetsBase = `http://localhost:${devPort}`;

    const isSegmentId = (value: string): value is SegmentId => (
        (segmentIds as readonly string[]).includes(value)
    );

    return defineConfig(({command, mode}) => {
        const segmentId = isSegmentId(mode) ? mode : defaultSegment;
        const publicAssetsBase = command === 'serve' ? devAssetsBase : productionAssetsBase;
        const noCardAssetsBase = command === 'serve'
            ? `${devAssetsBase}/assets/no-card`
            : PRODUCTION_ASSETS_BASE.noCard;
        const cardholderAssetsBase = command === 'serve'
            ? `${devAssetsBase}/assets/cardholder`
            : PRODUCTION_ASSETS_BASE.cardholder;
        const sharedAssetsBase = command === 'serve'
            ? `${devAssetsBase}/assets/shared`
            : `${PRODUCTION_ASSETS_BASE.cardholder}/clients/shared`;
        const introAssetsBase = command === 'serve'
            ? `${devAssetsBase}/assets/intro`
            : `${PRODUCTION_ASSETS_BASE.cardholder}/clients/inactive`;

        return {
            root: projectRoot,
            cacheDir,
            resolve: {
                alias: {
                    '@': fileURLToPath(new URL('./src', configUrl)),
                },
            },
            define: {
                __MINDBOX_SEGMENT__: JSON.stringify(segmentId),
                __PUBLIC_ASSETS_BASE__: JSON.stringify(publicAssetsBase),
                __NO_CARD_ASSETS_BASE__: JSON.stringify(noCardAssetsBase),
                __CARDHOLDER_ASSETS_BASE__: JSON.stringify(cardholderAssetsBase),
                __SHARED_ASSETS_BASE__: JSON.stringify(sharedAssetsBase),
                __INTRO_ASSETS_BASE__: JSON.stringify(introAssetsBase),
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        loadPaths: [sharedStylesDir],
                        additionalData: `@use 'abstracts/config' with ($public-assets-base: '${noCardAssetsBase}');\n`,
                    },
                },
            },
            server: {
                cors: true,
                host: '127.0.0.1',
                open: '/__vite-plugin-monkey.install.user.js',
                port: devPort,
                strictPort: true,
            },
            plugins: [
                monkey({
                    entry: 'src/app/main.ts',
                    generate: ({userscript, mode}) => mode === 'build' ? '' : userscript,
                    userscript: {
                        name: `${appName}: ${segmentId}`,
                        namespace: 'npm/vite-plugin-monkey',
                        match: ['https://www.coral.ru/*'],
                    },
                    build: {
                        fileName: `${appName}.user.js`,
                    },
                }),
                htmlBuildOutput(appName),
            ],
            build: {
                copyPublicDir: false,
                minify: true,
                outDir: outputDir ?? `dist/${segmentId}`,
            },
        };
    });
}
