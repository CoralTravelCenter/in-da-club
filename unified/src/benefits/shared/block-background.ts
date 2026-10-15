export interface BlockBackground {
    mobile: {src: string};
    desktop?: {src: string};
}

export function applyBlockBackground(block: HTMLElement, background?: BlockBackground): void {
    if (!background) return;

    const {mobile, desktop = mobile} = background;
    block.dataset.hasBackground = '';
    block.style.setProperty('--block-background-mobile', `url("${mobile.src}")`);
    block.style.setProperty('--block-background-desktop', `url("${desktop.src}")`);
}
