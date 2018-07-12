export function roundRect(rect: HTMLElement | ClientRect): ClientRect {
  if (rect instanceof HTMLElement) {
    rect = rect.getBoundingClientRect();
  }

  // There's rounding here because floating points make certain math not work.
  return {
    bottom: Math.floor(rect.top + rect.height),
    height: Math.floor(rect.height),
    left: Math.floor(rect.left),
    right: Math.floor(rect.left + rect.width),
    top: Math.floor(rect.top),
    width: Math.floor(rect.width),
  };
}

/**
 * Returns the common ancestor in the DOM of two nodes. From:
 * http://stackoverflow.com/a/7648545
 */
export function getCommonAncestor(
  nodeA: HTMLElement | null,
  nodeB: HTMLElement | null,
): HTMLElement | null {
  if (nodeA === null || nodeB === null) {
    return null;
  }

  const mask = 0x10;
  while (nodeA != null && nodeA.parentElement) {
    nodeA = nodeA.parentElement;
    // tslint:disable-next-line
    if ((nodeA.compareDocumentPosition(nodeB) & mask) === mask) {
      return nodeA;
    }
  }
  return null;
}

/**
 * Returns whether the target DOM node is a child of the root.
 */
export function isNodeAttached(node: HTMLElement | null, root: HTMLElement | null) {
  if (!node || !root) {
    return false;
  }
  return root.contains(node);
}
