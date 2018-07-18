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
 * Returns whether the target DOM node is a child of the root.
 */
export function isNodeAttached(node: HTMLElement | null, root: HTMLElement | null): boolean {
  if (!node || !root) {
    return false;
  }
  return root.contains(node);
}

/**
 * Returns whether the provided element is visible.
 */
export function isVisible(element: HTMLElement | null): boolean {
  return !!element && (element.offsetHeight !== 0 || element.offsetParent !== null);
}

/**
 * Returns if the element can receive focus.
 */
export function isFocusable(el: HTMLElement): boolean {
  if (el === document.activeElement) {
    return false;
  }
  // to prevent navigating to parent container elements with arc-focus-inside
  if (document.activeElement !== document.body && document.activeElement.contains(el)) {
    return false;
  }

  // Dev note: el.tabindex is not consistent across browsers
  const tabIndex = el.getAttribute('tabIndex');
  if (!tabIndex || +tabIndex < 0) {
    return false;
  }

  return isVisible(el);
}
