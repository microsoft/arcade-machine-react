import { IScrollableContainer, ScrollRegistry } from './scroll-registry';

/**
 * IScrollingAlgorithm is used to move the focused element into the view
 * of the browser.
 */
export interface IScrollingAlgorithm {
  /**
   * Triggers a scroll to the target element. Its bounds, as a client rect,
   * are computed and passed into it.
   */
  scrollTo(
    parent: Readonly<IScrollableContainer>,
    targetElement: HTMLElement,
    rect: ClientRect,
  ): void;
}

export class ScrollExecutor {
  constructor(
    private readonly registry: ScrollRegistry,
    private readonly algorithm: IScrollingAlgorithm,
  ) {}

  /**
   * Triggers a scroll to the target element. Its bounds, as a client rect,
   * are computed and passed into it.
   */
  public scrollTo(targetElement: HTMLElement, referenceRect: ClientRect) {
    const horizontal = referenceRect.left < 0 || referenceRect.right > window.innerWidth;
    if (!horizontal && referenceRect.top >= 0 && referenceRect.bottom < window.innerHeight) {
      return;
    }

    const parent = this.registry
      .getScrollContainers()
      .find(({ element }) => element.contains(targetElement));
    if (!parent) {
      return;
    }

    this.algorithm.scrollTo(parent, targetElement, referenceRect);
  }
}
