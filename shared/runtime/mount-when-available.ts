export interface MountWhenAvailableOptions {
    selector: string;
    start: (container: HTMLElement) => void | Promise<void>;
    onError?: (error: unknown) => void;
}

export function mountWhenAvailable({selector, start, onError}: MountWhenAvailableOptions): void {
    const handleError = onError ?? ((error: unknown): void => {
        console.error('Failed to mount application', error);
    });

    const tryMount = (): boolean => {
        const container = document.querySelector(selector);

        if (!(container instanceof HTMLElement)) {
            return false;
        }

        try {
            void Promise.resolve(start(container)).catch(handleError);
        } catch (error) {
            handleError(error);
        }
        return true;
    };

    if (tryMount()) return;

    const observer = new MutationObserver(() => {
        if (tryMount()) {
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
}
