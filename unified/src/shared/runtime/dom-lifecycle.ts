type Cleanup = () => void;

const cleanups = new WeakMap<Node, Set<Cleanup>>();

export function registerCleanup(owner: Node, cleanup: Cleanup): void {
    const ownerCleanups = cleanups.get(owner) ?? new Set<Cleanup>();
    ownerCleanups.add(cleanup);
    cleanups.set(owner, ownerCleanups);
}

function disposeNode(node: Node): void {
    for (const child of [...node.childNodes]) disposeNode(child);
    for (const cleanup of cleanups.get(node) ?? []) cleanup();
    cleanups.delete(node);
}

export function replaceChildrenWithCleanup(container: Element, ...nodes: Node[]): void {
    for (const child of [...container.childNodes]) disposeNode(child);
    container.replaceChildren(...nodes);
}
