import { IScrollingAlgorithm } from './';
import { IScrollableContainer } from './scroll-registry';
import { horizontalDelta, verticalDelta } from './util';

/**
 * NativeSmoothScrollingAlgorithm tries to use the new window.scrollTo API
 * to smoothly move the target element into the view. You can pass a fallback
 * algorithm to use on platforms where this methos is not supported.
 */
export class NativeSmoothScrollingAlgorithm implements IScrollingAlgorithm {
  constructor(private readonly fallback: IScrollingAlgorithm | null = null) {}

  public scrollTo(
    parent: Readonly<IScrollableContainer>,
    targetElement: HTMLElement,
    rect: ClientRect,
  ): void {
    const reference = parent.element.getBoundingClientRect();
    const horizontal = horizontalDelta(rect, reference);
    const vertical = verticalDelta(rect, reference);

    try {
      if (parent.vertical && vertical) {
        parent.element.scrollTo({ top: parent.element.scrollTop + vertical, behavior: 'smooth' });
      }
      if (parent.horizontal && horizontal) {
        parent.element.scrollTo({
          behavior: 'smooth',
          left: parent.element.scrollLeft + horizontal,
        });
      }
    } catch (e) {
      if (!this.fallback) {
        throw e;
      }

      this.fallback.scrollTo(parent, targetElement, rect);
    }
  }
}
