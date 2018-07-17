import { Direction, IArcHandler } from '../model';
import { IFocusStrategy } from './index';

export class FocusByRegistry implements IFocusStrategy {
  public findNextFocus(direction: Direction, arcHandler: IArcHandler) {
    const selectedEl = arcHandler;
    if (selectedEl) {
      switch (direction) {
        case Direction.Left:
          if (selectedEl.arcFocusLeft) {
            return this.getElement(selectedEl.arcFocusLeft);
          }
          break;
        case Direction.Right:
          if (selectedEl.arcFocusRight) {
            return this.getElement(selectedEl.arcFocusRight);
          }
          break;
        case Direction.Up:
          if (selectedEl.arcFocusUp) {
            return this.getElement(selectedEl.arcFocusUp);
          }
          break;
        case Direction.Down:
          if (selectedEl.arcFocusDown) {
            return this.getElement(selectedEl.arcFocusDown);
          }
          break;
        default:
      }
    }
    return null;
  }

  private getElement(el: HTMLElement | string) {
    if (typeof el === 'string') {
      return document.querySelector(el) as HTMLElement;
    }

    return el;
  }
}
