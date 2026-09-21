import {afterEach, describe, expect, it, vi} from 'vitest';
import {mountWhenAvailable} from './mount-when-available';

const ROOT_SELECTOR = '[data-bez-kart-root]';

afterEach(() => {
    document.body.replaceChildren();
});

describe('mountWhenAvailable', () => {
    it('starts immediately when the container already exists', () => {
        const container = document.createElement('div');
        container.dataset.bezKartRoot = '';
        document.body.append(container);
        const start = vi.fn();

        mountWhenAvailable({selector: ROOT_SELECTOR, start});

        expect(start).toHaveBeenCalledOnce();
        expect(start).toHaveBeenCalledWith(container);
    });

    it('waits for the container and starts only once', async () => {
        const start = vi.fn();
        mountWhenAvailable({selector: ROOT_SELECTOR, start});

        document.body.append(document.createElement('div'));
        const container = document.createElement('div');
        container.dataset.bezKartRoot = '';
        document.body.append(container);

        await vi.waitFor(() => expect(start).toHaveBeenCalledOnce());
        document.body.append(document.createElement('div'));
        await Promise.resolve();

        expect(start).toHaveBeenCalledWith(container);
        expect(start).toHaveBeenCalledTimes(1);
    });
});
