export interface BlockBackground {
    src: string;
}

export function applyBlockBackground(block: HTMLElement, background?: BlockBackground): void {
    if (!background) return;

    block.dataset.hasBackground = '';
    block.style.setProperty('--block-background', `url("${background.src}")`);
}
