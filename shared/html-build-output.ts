import type {Plugin} from 'vite';

export function htmlBuildOutput(appName: string): Plugin {
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
