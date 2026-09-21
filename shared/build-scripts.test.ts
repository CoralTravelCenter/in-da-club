// @vitest-environment node

import {describe, expect, it} from 'vitest';
import packageJson from '../package.json';
import {SEGMENT_IDS as BEZ_KART_SEGMENT_IDS} from '../bez-kart/src/segments/segment.types';
import {SEGMENT_IDS as S_KARTAMI_SEGMENT_IDS} from '../s-kartami/src/segments/segment.types';

const scripts: Record<string, string> = packageJson.scripts;

function expectSegmentBuildScripts(appName: string, segmentIds: readonly string[]): void {
    const prefix = `build:${appName}:`;
    const expectedNames = segmentIds.map((segmentId) => `${prefix}${segmentId}`);
    const actualNames = Object.keys(scripts)
        .filter((name) => name.startsWith(prefix))
        .sort();

    expect(actualNames).toEqual([...expectedNames].sort());

    for (const segmentId of segmentIds) {
        const scriptName = `${prefix}${segmentId}`;
        expect(scripts[scriptName]).toBe(
            `vite build --config ${appName}/vite.config.ts --mode ${segmentId}`,
        );
        expect(scripts[`build:${appName}`]).toContain(`npm run ${scriptName}`);
    }
}

describe('segment build scripts', () => {
    it('matches bez-kart segment ids', () => {
        expectSegmentBuildScripts('bez-kart', BEZ_KART_SEGMENT_IDS);
    });

    it('matches s-kartami segment ids', () => {
        expectSegmentBuildScripts('s-kartami', S_KARTAMI_SEGMENT_IDS);
    });
});
