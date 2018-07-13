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
  public readonly target: HTMLElement;

  /**
   * Whether the default action (focus change) of this event
   * has been cancelled.
   */
  public readonly defaultPrevented = false;

  /**
   * Callback for when propogation is stopped.
   */
  protected propogationStopped = false;

  constructor(options: { directive?: IArcHandler; event: Button; target: HTMLElement }) {
    this.directive = options.directive;
    this.event = options.event;
    this.target = options.target;
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
