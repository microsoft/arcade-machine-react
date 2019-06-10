import { IScrollingAlgorithm } from './index';
import { IScrollableContainer } from './scroll-registry';
import { horizontalDelta, verticalDelta } from './util';

/**
 * An EasingFunction is passed into the SmoothScrollingAlgorithm. It takes
 * a bounds and a progress percentage, from 0 to 1, and returns the number
 * we should be at.
 */
export type EasingFunction = (start: number, end: number, progress: number) => number;

/**
 * A quadratic smooth scrolling algorithm.
 */
function quadSmoothing(start: number, end: number, progress: number): number {
  const diff = end - start;
  if (progress < 0.5) {
    return diff * (2 * progress ** 2) + start;
  } else {
    const displaced = progress - 1;
    return diff * (-2 * displaced ** 2 + 1) + start;
  }
}

/**
 * SmoothScrollingAlgorithm is a scrolling algorithm that gradually moves
 * to the target element using the provided algorithm.
 */
export class SmoothScrollingAlgorithm implements IScrollingAlgorithm {
  constructor(
    private readonly scrollSpeed: number = 1000,
    private readonly smoothing: EasingFunction = quadSmoothing,
  ) {}

  public scrollTo(
    parent: Readonly<IScrollableContainer>,
    // tslint:disable-next-line
    _el: HTMLElement,
    referenceRect: ClientRect,
  ): void {
    // Animation function to transition a scroll on the `parent` from the
    // `original` value to the `target` value by calling `set.
    const animate = (delta: number, original: number, setter: (x: number) => void) => {
      if (delta === 0) {
        return;
      }
      const target = original + delta;
      const start = performance.now();
      const duration = (Math.abs(target - original) / this.scrollSpeed) * 1000;
      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setter(this.smoothing(original, target, progress));

        if (progress < 1) {
          requestAnimationFrame(run);
        }
      };

      requestAnimationFrame(run);
    };

    const reference = parent.element.getBoundingClientRect();
    if (parent.horizontal) {
      animate(
        horizontalDelta(referenceRect, reference),
        parent.element.scrollLeft,
        x => (parent.element.scrollLeft = x),
      );
    }

    if (parent.vertical) {
      animate(
        verticalDelta(referenceRect, reference),
        parent.element.scrollTop,
        x => (parent.element.scrollTop = x),
      );
    }
  }
}
