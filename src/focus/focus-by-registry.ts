import { IFocusStrategy } from '.';
import { Button, IArcHandler } from '../model';

export class FocusByRegistry implements IFocusStrategy {
  public findNextFocus(direction: Button, arcHandler: IArcHandler) {
    const selectedEl = arcHandler;
    if (selectedEl) {
      switch (direction) {
        case Button.Left:
          if (selectedEl.arcFocusLeft) {
            return this.getElement(selectedEl.arcFocusLeft);
          }
          break;
        case Button.Right:
          if (selectedEl.arcFocusRight) {
            return this.getElement(selectedEl.arcFocusRight);
          }
          break;
        case Button.Up:
          if (selectedEl.arcFocusUp) {
            return this.getElement(selectedEl.arcFocusUp);
          }
          break;
        case Button.Down:
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
