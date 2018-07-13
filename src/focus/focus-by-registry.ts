import { IFocusOptions, IFocusStrategy } from '.';
import { findElement } from '../internal-types';
import { Button } from '../model';

/**
 * FocusByRegistry is an IFocusStrategy which looks at handlers attached
 * to the directive and, if they have a configured focus override in
 * the given direction, return the relevant element.
 */
export class FocusByRegistry implements IFocusStrategy {
  public findNextFocus({ direction, directive }: IFocusOptions) {
    if (!directive) {
      return null;
    }

    switch (direction) {
      case Button.Left:
        if (directive.arcFocusLeft) {
          return findElement(document.body, directive.arcFocusLeft);
        }
        break;
      case Button.Right:
        if (directive.arcFocusRight) {
          return findElement(document.body, directive.arcFocusRight);
        }
        break;
      case Button.Up:
        if (directive.arcFocusUp) {
          return findElement(document.body, directive.arcFocusUp);
        }
        break;
      case Button.Down:
        if (directive.arcFocusDown) {
          return findElement(document.body, directive.arcFocusDown);
        }
        break;
      default:
    }

    return null;
  }
}
