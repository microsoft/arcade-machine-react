import { Button, isHorizontal } from '../model';
import { isFocusable, isNodeAttached } from './dom-utils';
import { IFocusOptions, IFocusStrategy } from './index';

// These factors can be tweaked to adjust which elements are favored by the focus algorithm
const scoringConstants = {
  fastSearchMaxPointChecks: 30,
  fastSearchMinimumDistance: 40,
  fastSearchPointDistance: 10,
  maxFastSearchSize: 0.5,
};

/**
 * findNextFocusByRaycast is a speedy implementation of focus searching
 * that uses a raycast to determine the next best element.
 */
export class FocusByRaycastStrategy implements IFocusStrategy {
  public findNextFocus({ referenceRect, direction, activeElement, root }: IFocusOptions) {
    let maxDistance =
      scoringConstants.maxFastSearchSize *
      (isHorizontal(direction) ? referenceRect.width : referenceRect.height);
    if (maxDistance < scoringConstants.fastSearchMinimumDistance) {
      maxDistance = scoringConstants.fastSearchMinimumDistance;
    }

    // Sanity check so that we don't freeze if we get some insanely big element
    let searchPointDistance = scoringConstants.fastSearchPointDistance;
    if (maxDistance / searchPointDistance > scoringConstants.fastSearchMaxPointChecks) {
      searchPointDistance = maxDistance / scoringConstants.fastSearchMaxPointChecks;
    }

    let baseX: number;
    let baseY: number;
    let seekX = 0;
    let seekY = 0;
    switch (direction) {
      case Button.Left:
        baseX = referenceRect.left - 1;
        baseY = referenceRect.top + referenceRect.height / 2;
        seekX = -1;
        break;
      case Button.Right:
        baseX = referenceRect.left + referenceRect.width + 1;
        baseY = referenceRect.top + referenceRect.height / 2;
        seekX = 1;
        break;
      case Button.Up:
        baseX = referenceRect.left + referenceRect.width / 2;
        baseY = referenceRect.top - 1;
        seekY = -1;
        break;
      case Button.Down:
        baseX = referenceRect.left + referenceRect.width / 2;
        baseY = referenceRect.top + referenceRect.height + 1;
        seekY = 1;
        break;
      default:
        throw new Error('Invalid direction');
    }

    for (let i = 0; i < maxDistance; i += searchPointDistance) {
      const el = document.elementFromPoint(baseX + seekX * i, baseY + seekY * i) as HTMLElement;

      if (!el || el === activeElement) {
        continue;
      }

      if (!isNodeAttached(el, root) || !isFocusable(el)) {
        continue;
      }

      return el;
    }

    return null;
  }
}
