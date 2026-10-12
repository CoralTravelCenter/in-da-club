import {describe, expect, it} from 'vitest';
import {getDevPreview} from './dev-preview';

describe('getDevPreview', () => {
    it.each([
        ['0', 'new-client'],
        ['1', 'regular-1'],
        ['2', 'regular-2'],
        ['3', 'regular-3'],
    ] as const)('selects prospect segment %s', (value, segmentId) => {
        expect(getDevPreview(`?cb_client=${value}`)).toEqual({
            scenario: 'prospect',
            segmentId,
        });
    });

    it.each([
        ['0', 'inactive'],
        ['1', 'one-trip'],
        ['2', 'two-trips'],
        ['3', 'three-plus'],
    ] as const)('selects member segment %s', (value, segmentId) => {
        expect(getDevPreview(`?ride=${value}`)).toEqual({
            scenario: 'member',
            segmentId,
        });
    });

    it('gives ride priority over cb_client', () => {
        expect(getDevPreview('?cb_client=2&ride=1')).toEqual({
            scenario: 'member',
            segmentId: 'one-trip',
        });
    });

    it.each(['', '?ride=4', '?cb_client=unknown'])('ignores missing or invalid parameters: %s', (search) => {
        expect(getDevPreview(search)).toBeNull();
    });
});
