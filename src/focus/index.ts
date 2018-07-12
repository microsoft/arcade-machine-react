import { Button, IArcHandler } from '../model';

export interface IFocusOptions {
  /**
   * The direction the focus is going.
   */
  direction: Button;

  /**
   * The last element that was focuse.
   */
  element?: HTMLElement;
}

/**
 * IFocusStrategy is a method of finding the next focusable element. Used
 * within the focus service.
 */
export interface IFocusStrategy {
  findNextFocus(direction: Button, arcHandler: IArcHandler): HTMLElement | null;
}
