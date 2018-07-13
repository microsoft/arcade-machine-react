import { ArcEvent } from './arc-event';
import { FocusContext } from './focus';
import { Button, IArcHandler } from './model';

/**
 * An ArcFocusEvent is an event that fires when a directional button is
 * pressed on the controller or keyboard.
 */
export class ArcFocusEvent extends ArcEvent {
  /**
   * `next` is the element that we'll select next, on directional navigation,
   * unless the element is cancelled. This *is* settable and you can use it
   * to modify the focus target.
   */
  public get next() {
    return this.nextElement;
  }

  public set next(next: HTMLElement | null) {
    this.nextElement = next;
    this.stopPropagation();
  }

  /**
   * Focus context used to create this event.
   */
  public readonly focusContext: FocusContext;

  private nextElement: HTMLElement | null;

  constructor(options: {
    directive?: IArcHandler;
    next: HTMLElement | null;
    event: Button;
    target: HTMLElement;
    context: FocusContext;
  }) {
    super(options);
    this.nextElement = options.next;
    this.focusContext = options.context;
  }
}
