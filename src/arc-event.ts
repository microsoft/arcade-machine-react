import { Button, IArcHandler } from './model';

/**
 * ArcEvents are fired on an element when an input occurs. They include
 * information about the input and provide utilities similar to standard
 * HTML events.
 */
export class ArcEvent {
  /**
   * The 'arc' directive reference, may not be filled for elements which
   * are focusable without the directive, like form controls.
   */
  public readonly directive?: IArcHandler;

  /**
   * The direction we're navigating.
   */
  public readonly event: Button;

  /**
   * The currently focused element we're navigating from.
   */
  public readonly target: HTMLElement | null;

  /**
   * `next` is the element that we'll select next, on directional navigation,
   * unless the element is cancelled. This *is* settable and you can use it
   * to modify the focus target. This will be set to `null` on non-directional
   * navigation or if we can't find a subsequent element to select.
   */
  public next: HTMLElement | null;

  /**
   * Whether the default action (focus change) of this event
   * has been cancelled.
   */
  public readonly defaultPrevented = false;

  /**
   * Callback for when propogation is stopped.
   */
  protected propogationStopped = false;

  constructor(options: {
    directive?: IArcHandler;
    next: HTMLElement | null;
    event: Button;
    target: HTMLElement | null;
  }) {
    this.directive = options.directive;
    this.event = options.event;
    this.target = options.target;
    this.next = options.next;
  }

  /**
   * Can be called to prevent the event from bubbling to higher up listeners.
   */
  public stopPropagation() {
    this.propogationStopped = true;
  }

  /**
   * Can be called to prevent the focus from changing, or the action from
   * otherwise submitting, as a result of this event.
   */
  public preventDefault() {
    (this as any).defaultPrevented = true;
  }
}
