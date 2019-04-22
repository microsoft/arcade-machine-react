/**
 * Returns the difference the page has to be moved horizontall to bring
 * the target rect into view.
 */
export function horizontalDelta(rect: ClientRect) {
  return rect.left < 0
    ? rect.left
    : rect.right > window.innerWidth
    ? rect.right - window.innerWidth
    : 0;
}

/**
 * Returns the difference the page has to be moved vertically to bring
 * the target rect into view.
 */
export function verticalDelta(rect: ClientRect) {
  return rect.top < 0
    ? rect.top
    : rect.bottom > window.innerHeight
    ? rect.bottom - window.innerHeight
    : 0;
}
