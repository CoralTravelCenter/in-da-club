import {readdir, readFile, writeFile} from 'node:fs/promises';
import {extname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import Typograf from 'typograf';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const tagPattern = /typographed`((?:\\.|[^`])*)`/g;
const typograf = new Typograf({locale: ['ru']});

async function collectTypeScriptFiles(directory) {
    const entries = await readdir(directory, {withFileTypes: true});
    const files = [];

    for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...await collectTypeScriptFiles(path));
        } else if (extname(entry.name) === '.ts' && !entry.name.endsWith('.test.ts')) {
            files.push(path);
        }
    }

    return files;
}

function typographSource(source, path) {
    return source.replace(tagPattern, (match, text) => {
        if (text.includes('${')) {
            throw new Error(`Шаблон с интерполяцией не поддерживается: ${path}`);
        }

        const result = typograf.execute(text);
        return `typographed\`${result.replaceAll('`', '\\`')}\``;
    });
}

let changedFiles = 0;

for (const path of await collectTypeScriptFiles(sourceRoot)) {
    const source = await readFile(path, 'utf8');
    const result = typographSource(source, path);

    if (result !== source) {
        await writeFile(path, result);
        changedFiles += 1;
    }
}

console.log(`Typograf: обновлено файлов — ${changedFiles}`);
