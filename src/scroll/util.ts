/**
 * Returns the difference the page has to be moved horizontall to bring
 * the target rect into view.
 */
export function horizontalDelta(rect: ClientRect, reference: ClientRect) {
  return rect.left < reference.left
    ? rect.left - reference.left
    : rect.right > reference.right
    ? rect.right - reference.right
    : 0;
}

/**
 * Returns the difference the page has to be moved vertically to bring
 * the target rect into view.
 */
export function verticalDelta(rect: ClientRect, reference: ClientRect) {
  return rect.top < reference.top
    ? rect.top - reference.top
    : rect.bottom > reference.bottom
    ? rect.bottom - reference.bottom
    : 0;
}
