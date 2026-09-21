export interface MountWhenAvailableOptions {
    selector: string;
    start: (container: HTMLElement) => void | Promise<void>;
}

export function mountWhenAvailable({selector, start}: MountWhenAvailableOptions): void {
    const tryMount = (): boolean => {
        const container = document.querySelector(selector);

        if (!(container instanceof HTMLElement)) {
            return false;
        }

        void start(container);
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
