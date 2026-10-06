// @vitest-environment jsdom

import {describe, expect, it} from 'vitest';
import {localStorage as reactiveLocalStorage} from 'reactive-localstorage';

describe('reactive localStorage adapter', () => {
    it('exposes the subscription contract used by the client router', () => {
        expect(reactiveLocalStorage.getItem).toBeTypeOf('function');
        expect(reactiveLocalStorage.on).toBeTypeOf('function');
        expect(reactiveLocalStorage.off).toBeTypeOf('function');
    });
});
