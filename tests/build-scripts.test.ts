// @vitest-environment node

import {describe, expect, it} from 'vitest';
import packageJson from '../package.json';

const scripts: Record<string, string> = packageJson.scripts;
const EXPECTED_SCRIPT_NAMES = [
    'dev',
    'build',
    'typograf',
    'typecheck',
    'test',
];

describe('segment build scripts', () => {
    it('exposes only supported project commands', () => {
        expect(Object.keys(scripts).sort()).toEqual(EXPECTED_SCRIPT_NAMES.sort());
    });

    it('exposes the unified development server with typography normalization', () => {
        expect(scripts.dev).toBe(
            'node scripts/typograf.mjs unified/src && vite --config unified/vite.config.ts --mode unified',
        );
    });

    it('builds unified after typography normalization and typecheck', () => {
        expect(scripts.build).toBe(
            'node scripts/typograf.mjs unified/src && tsc -p unified/tsconfig.json && vite build --config unified/vite.config.ts --mode unified',
        );
    });
});
