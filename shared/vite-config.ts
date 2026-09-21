import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import monkey from 'vite-plugin-monkey';
import {htmlBuildOutput} from './html-build-output.ts';

interface ViteConfigOptions<SegmentId extends string> {
    appName: string;
    configUrl: string;
    segmentIds: readonly SegmentId[];
    defaultSegment: SegmentId;
    devPort: number;
    productionAssetsBase: string;
}

export function createViteConfig<const SegmentId extends string>({
    appName,
    configUrl,
    segmentIds,
    defaultSegment,
    devPort,
    productionAssetsBase,
}: ViteConfigOptions<SegmentId>) {
    const projectRoot = fileURLToPath(new URL('.', configUrl));
    const cacheDir = fileURLToPath(new URL(`../node_modules/.vite/${appName}`, configUrl));
    const sharedStylesDir = fileURLToPath(new URL('../shared/styles', configUrl));
    const devAssetsBase = `http://localhost:${devPort}`;

    const isSegmentId = (value: string): value is SegmentId => (
        (segmentIds as readonly string[]).includes(value)
    );

    return defineConfig(({command, mode}) => {
        const segmentId = isSegmentId(mode) ? mode : defaultSegment;
        const publicAssetsBase = command === 'serve' ? devAssetsBase : productionAssetsBase;

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
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        loadPaths: [sharedStylesDir],
                        additionalData: `@use 'abstracts/config' with ($public-assets-base: '${publicAssetsBase}');\n`,
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
                    entry: 'src/main.ts',
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
                outDir: `dist/${segmentId}`,
            },
        };
    });
}
