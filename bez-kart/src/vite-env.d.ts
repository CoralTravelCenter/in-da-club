/// <reference types="vite/client" />

declare const __MINDBOX_SEGMENT__: import('./segments/segment.types').SegmentId;

declare module 'scroll-lock' {
    export function addLockableTarget(target: HTMLElement): void;
    export function disablePageScroll(scrollableTarget?: HTMLElement): void;
    export function enablePageScroll(scrollableTarget?: HTMLElement): void;
}
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />
