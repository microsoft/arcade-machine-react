import { ArcEvent } from './arc-event';
import { ArcFocusEvent } from './arc-focus-event';
import { FocusContext, IElementStore, IFocusStrategy } from './focus';
import { isFocusable, isNodeAttached, roundRect } from './focus/dom-utils';
import { isForForm } from './focus/is-for-form';
import { rescroll } from './focus/rescroll';
import { propogationStoped, resetEvent } from './internal-types';
import { Button, IArcHandler, isDirectional } from './model';
import { StateContainer } from './state/state-container';

export class FocusService {
  /**
   * Maximum number of times we re-bubble an event on a focus change.
   * Used to prevent infinite loops.
   */
  public static maxFocusInterations = 10;

  /**
   * Animation speed in pixels per second for scrolling elements into view.
   * This can be Infinity to disable the animation, or null to disable scrolling.
   */
  public scrollSpeed: number | null = 1000;

  // The client bounding rect when we first selected the element, cached
  // so that we can reuse it if the element gets detached.
  private referenceRect: ClientRect = {
    bottom: -1,
    height: 0,
    left: -1,
    right: -1,
    top: -1,
    width: 0,
  };

  /**
   * The previously selected element.
   */
  private previousSelectedElement = this.elementStore.element;

  constructor(
    private readonly registry: StateContainer,
    private readonly root: HTMLElement,
    private readonly strategies: IFocusStrategy[],
    private readonly elementStore: IElementStore,
  ) {
    this.setDefaultFocus();
  }

  /**
   * Wrapper around moveFocus to dispatch arcselectingnode event
   */
  public selectNode(next: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    if (!this.root.contains(next)) {
      return;
    }

    this.selectNodeWithoutEvent(next, scrollSpeed);
  }

  /**
   * Updates the selected DOM node.
   * This is useful when you do not want to dispatch another event
   * e.g. when intercepting and transfering focus
   */
  public selectNodeWithoutEvent(next: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    const previous = this.elementStore.element;
    if (!this.root) {
      throw new Error('root not set');
    }
    if (previous === next) {
      return;
    }

    this.referenceRect = next.getBoundingClientRect();
    rescroll(next, this.referenceRect, scrollSpeed, this.root);
    this.previousSelectedElement = previous;
    this.elementStore.element = next;
  }

  /**
   * sendButton sends a directional input through the focus service.
   * Returns whether the button press was used to trigger an ArcEvent
   * by the focus service.
   */
  public sendButton(direction: Button): boolean {
    const selected = this.elementStore.element;
    if (isForForm(direction, selected)) {
      return false;
    }

    const ev = this.createArcEvent(direction, selected);
    this.bubbleEvent(ev, 'onButton', selected);
    if (ev.defaultPrevented) {
      return true;
    }
    if (!(ev instanceof ArcFocusEvent)) {
      return this.defaultFires(ev);
    }

    let originalNext = ev.next;
    for (let i = 0; i < FocusService.maxFocusInterations; i++) {
      if (this.bubbleInOut(ev, selected)) {
        return true;
      }
      if (originalNext === ev.next) {
        return this.defaultFires(ev);
      }

      originalNext = ev.next;
      resetEvent(ev);
    }

    throw new Error('Max iterations exceeded');
  }

  /**
   * Creates an arcade-machine event to fire the given press. If a direction
   * is given, we'll find an appropriate focusable element.
   */
  private createArcEvent(direction: Button, selected: HTMLElement): ArcEvent {
    if (!isDirectional(direction)) {
      return new ArcEvent({
        directive: this.registry.find(selected),
        event: direction,
        target: selected,
      });
    }

    const context = new FocusContext(this.root, direction, this.strategies, {
      activeElement: selected,
      directive: this.registry.find(selected),
      previousElement: this.previousSelectedElement,
      referenceRect: this.root.contains(selected)
        ? selected.getBoundingClientRect()
        : this.referenceRect,
    });

    return new ArcFocusEvent({
      context,
      directive: this.registry.find(selected),
      event: direction,
      next: context ? context.find(this.root) : null,
      target: selected,
    });
  }

  /**
   * Attempts to effect the focus command, returning a
   * boolean if it was handled and no further action should be taken.
   */
  private bubbleInOut(ev: ArcFocusEvent, selected: HTMLElement): boolean {
    const originalNext = ev.next;
    if (isNodeAttached(selected, this.root)) {
      this.bubbleEvent(ev, 'onOutgoing', selected);
    }

    // Abort if the user handled
    if (ev.defaultPrevented || originalNext !== ev.next) {
      return ev.defaultPrevented;
    }

    // Bubble once more on the target.
    if (ev.next) {
      this.bubbleEvent(ev, 'onIncoming', ev.next);
    }

    return ev.defaultPrevented;
  }

  private defaultFires(ev: ArcEvent, scrollSpeed: number | null = this.scrollSpeed): boolean {
    if (ev.defaultPrevented) {
      return true;
    }

    if (ev instanceof ArcFocusEvent && ev.next !== null) {
      this.selectNode(ev.next, scrollSpeed);
      return true;
    } else if (ev.event === Button.Submit) {
      this.elementStore.element.click();
      return true;
    }

    return false;
  }

  /**
   * Bubbles the ArcEvent from the currently selected element
   * to all parent arc directives.
   */
  private bubbleEvent(
    ev: ArcEvent,
    trigger: keyof IArcHandler,
    source: HTMLElement | null,
  ): ArcEvent {
    for (let el = source; !propogationStoped(ev) && el !== this.root && el; el = el.parentElement) {
      if (el === undefined) {
        // tslint:disable-next-line
        console.warn(
          `arcade-machine focusable element was moved outside of` +
            'the focus root. We may not be able to handle focus correctly.',
          el,
        );
        break;
      }

      const directive = this.registry.find(el);
      if (!directive) {
        continue;
      }

      const fn = directive[trigger] as (ev: ArcEvent) => void;
      if (fn) {
        fn(ev);
      }
    }

    return ev;
  }

  /**
   * Reset the focus if arcade-machine wanders out of root
   */
  private setDefaultFocus(scrollSpeed: number | null = this.scrollSpeed) {
    const focusableElems = this.root.querySelectorAll('[tabIndex]');

    // tslint:disable-next-line
    for (let i = 0; i < focusableElems.length; i += 1) {
      const potentialElement = focusableElems[i] as HTMLElement;
      if (this.elementStore.element === potentialElement || !isFocusable(potentialElement)) {
        continue;
      }
      const potentialRect = roundRect(potentialElement.getBoundingClientRect());
      // Skip elements that have either a width of zero or a height of zero
      if (potentialRect.width === 0 || potentialRect.height === 0) {
        continue;
      }

      this.selectNode(potentialElement, scrollSpeed);
      return;
    }
  }
}
