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
    let parent: Readonly<IScrollableContainer> | undefined;
    for (const candidate of this.registry.getScrollContainers()) {
      if (candidate.element.contains(targetElement)) {
        if (!parent || parent.element.contains(candidate.element)) {
          parent = candidate;
        }
      }
    }

    if (!parent) {
      return;
    }

    this.algorithm.scrollTo(parent, targetElement, referenceRect);
  }
}
