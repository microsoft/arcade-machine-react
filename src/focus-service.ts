import { Subscription } from 'rxjs';

import { ArcEvent } from './arc-event';
import { ElementFinder } from './focus-strategies/focus-by-distance';
import { FocusByRegistry } from './focus-strategies/focus-by-registry';
import { Direction, isDirectional, isHorizontal } from './model';
import { StateContainer } from './state/state-container';

const defaultFocusRoot = document.body;
// These factors can be tweaked to adjust which elements are favored by the focus algorithm
const scoringConstants = Object.freeze({
  fastSearchMaxPointChecks: 30,
  fastSearchMinimumDistance: 40,
  fastSearchPointDistance: 10,
  maxFastSearchSize: 0.5,
});

interface IFocusState {
  root: HTMLElement;
  focusedElem: HTMLElement | null;
}

interface IReducedClientRect {
  top: number;
  left: number;
  height: number;
  width: number;
}

// Default client rect to use. We set the top, left, bottom and right
// properties of the referenceBoundingRectangle to '-1' (as opposed to '0')
// because we want to make sure that even elements that are up to the edge
// of the screen can receive focus.
const defaultRect: ClientRect = Object.freeze({
  bottom: -1,
  height: 0,
  left: -1,
  right: -1,
  top: -1,
  width: 0,
});

function roundRect(rect: HTMLElement | ClientRect): ClientRect {
  if (rect instanceof HTMLElement) {
    rect = rect.getBoundingClientRect();
  }

  // There's rounding here because floating points make certain math not work.
  return {
    bottom: Math.floor(rect.top + rect.height),
    height: Math.floor(rect.height),
    left: Math.floor(rect.left),
    right: Math.floor(rect.left + rect.width),
    top: Math.floor(rect.top),
    width: Math.floor(rect.width),
  };
}

/**
 * Returns the common ancestor in the DOM of two nodes. From:
 * http://stackoverflow.com/a/7648545
 */
function getCommonAncestor(
  nodeA: HTMLElement | null,
  nodeB: HTMLElement | null,
): HTMLElement | null {
  if (nodeA === null || nodeB === null) {
    return null;
  }

  const mask = 0x10;
  while (nodeA != null && nodeA.parentElement) {
    nodeA = nodeA.parentElement;
    // tslint:disable-next-line
    if ((nodeA.compareDocumentPosition(nodeB) & mask) === mask) {
      return nodeA;
    }
  }
  return null;
}

/**
 * Interpolation with quadratic speed up and slow down.
 */
function quad(start: number, end: number, progress: number): number {
  const diff = end - start;
  if (progress < 0.5) {
    return diff * (2 * progress ** 2) + start;
  } else {
    const displaced = progress - 1;
    return diff * (-2 * displaced ** 2 + 1) + start;
  }
}

/**
 * Returns whether the target DOM node is a child of the root.
 */
function isNodeAttached(node: HTMLElement | null, root: HTMLElement | null) {
  if (!node || !root) {
    return false;
  }
  return root.contains(node);
}

export class FocusService {
  public enableRaycast = false;
  public focusedClass = 'arc--selected-direct';

  /**
   * Animation speed in pixels per second for scrolling elements into view.
   * This can be Infinity to disable the animation, or null to disable scrolling.
   */
  public scrollSpeed: number | null = 1000;
  public focusRoot: HTMLElement = defaultFocusRoot;
  // The currently selected element.
  public selected: HTMLElement | null = null;
  // Focus root, the service operates below here.
  private root: HTMLElement | null = null;
  // Subscription to focus update events.
  private registrySubscription?: Subscription;

  private prevElement: HTMLElement | undefined;
  // The client bounding rect when we first selected the element, cached
  // so that we can reuse it if the element gets detached.
  private referenceRect: ClientRect = defaultRect;
  private focusStack: IFocusState[] = [];
  private focusByRegistry = new FocusByRegistry();

  constructor(private registry: StateContainer) {}

  public trapFocus(newRootElem: HTMLElement) {
    this.focusStack.push({
      focusedElem: this.selected,
      root: this.focusRoot,
    });
    this.focusRoot = newRootElem;
  }

  public releaseFocus(releaseElem?: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    if (releaseElem) {
      if (releaseElem === this.focusRoot) {
        this.releaseFocus(undefined, scrollSpeed);
      }
      return;
    }

    const lastFocusState = this.focusStack.pop();
    if (lastFocusState && lastFocusState.focusedElem) {
      this.focusRoot = lastFocusState.root;
      this.selectNode(lastFocusState.focusedElem, scrollSpeed);
    } else {
      throw new Error(
        'No more focus traps to release. Make sure you call trapFocus before using releaseFocus',
      );
    }
  }

  /**
   * Useful for resetting all focus traps e.g. on page navigation
   */
  public clearAllTraps() {
    this.focusStack.length = 0;
    this.focusRoot = defaultFocusRoot;
  }

  /**
   * Sets the root element to use for focusing.
   */
  public setRoot(root: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    if (this.registrySubscription) {
      this.registrySubscription.unsubscribe();
    }

    this.root = root;

    if (!this.selected) {
      return;
    }

    if (!root.contains(this.selected)) {
      this.setDefaultFocus(scrollSpeed);
    }
  }

  /**
   * onFocusChange is called when any element in the DOM gains focus. We use
   * this is handle adjustments if the user interacts with other input
   * devices, or if other application logic requests focus.
   */
  public onFocusChange(focus: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    this.selectNode(focus, scrollSpeed);
  }

  /**
   * Wrapper around moveFocus to dispatch arcselectingnode event
   */
  public selectNode(next: HTMLElement, scrollSpeed: number | null = this.scrollSpeed) {
    if (!this.focusRoot.contains(next)) {
      return;
    }

    const canceled = !next.dispatchEvent(
      new Event('arcselectingnode', { bubbles: true, cancelable: true }),
    );
    if (canceled) {
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
    if (!this.root) {
      throw new Error('root not set');
    }
    if (this.selected === next) {
      return;
    }

    this.prevElement = this.selected || undefined;

    this.triggerOnFocusHandlers(next);
    this.switchFocusClass(this.selected, next, this.focusedClass);
    this.selected = next;
    this.referenceRect = next.getBoundingClientRect();
    this.rescroll(next, scrollSpeed, this.root);

    const canceled = !next.dispatchEvent(
      new Event('arcfocuschanging', { bubbles: true, cancelable: true }),
    );
    if (!canceled) {
      next.focus();
    }
  }

  /**
   * Frees resources associated with the service.
   */
  public teardown() {
    if (!this.registrySubscription) {
      return;
    }
    this.registrySubscription.unsubscribe();
  }

  public createArcEvent(direction: Direction): ArcEvent {
    const directive = this.selected ? this.registry.find(this.selected) : undefined;

    let nextElem: HTMLElement | null = null;
    if (isDirectional(direction)) {
      let refRect = this.referenceRect;

      if (this.selected && this.focusRoot.contains(this.selected)) {
        refRect = this.selected.getBoundingClientRect();
      }

      nextElem = this.getFocusableElement(
        direction,
        this.focusRoot,
        refRect,
        new Set<HTMLElement>(),
      );
    }

    return new ArcEvent({
      directive,
      event: direction,
      next: nextElem,
      target: this.selected,
    });
  }
  /**
   * Attempts to effect the focus command, returning a
   * boolean if it was handled.
   */
  public bubble(ev: ArcEvent): boolean {
    if (isNodeAttached(this.selected, this.root)) {
      this.bubbleEvent(ev, false);
    }

    // Abort if the user handled
    if (ev.defaultPrevented) {
      return true;
    }

    // Bubble once more on the target.
    if (ev.next) {
      this.bubbleEvent(ev, true, ev.next);
      if (ev.defaultPrevented) {
        return true;
      }
    }

    return false;
  }

  public defaultFires(ev: ArcEvent, scrollSpeed: number | null = this.scrollSpeed): boolean {
    if (ev.defaultPrevented) {
      return true;
    }

    const directional = isDirectional(ev.event);
    if (directional && ev.next !== null) {
      this.selectNode(ev.next, scrollSpeed);
      return true;
    } else if (ev.event === Direction.Submit) {
      if (this.selected) {
        this.selected.click();
        return true;
      }
    }

    return false;
  }

  private getFocusableElement(
    direction: Direction,
    root: HTMLElement,
    refRect: ClientRect,
    ignore: Set<HTMLElement>,
  ): HTMLElement | null {
    let nextFocusableEl = this.findNextFocusable(direction, root, refRect, ignore);

    if (!nextFocusableEl) {
      return null;
    }

    const directive = this.registry.find(nextFocusableEl);
    if (directive && directive.arcFocusInside) {
      const elementInside = this.getFocusableElement(direction, nextFocusableEl, refRect, ignore);

      // get focusable again if no focusable elements inside the current element
      nextFocusableEl =
        elementInside ||
        this.getFocusableElement(direction, root, refRect, ignore.add(nextFocusableEl));
    }

    return nextFocusableEl;
  }

  private findNextFocusable(
    direction: Direction,
    root: HTMLElement,
    refRect: ClientRect,
    ignore: Set<HTMLElement>,
  ) {
    const directive = this.selected ? this.registry.find(this.selected) : undefined;
    let nextElem: HTMLElement | null = null;

    if (directive) {
      nextElem = this.focusByRegistry.findNextFocus(direction, directive);
    }

    if (!nextElem && this.enableRaycast) {
      nextElem = this.findNextFocusByRaycast(direction, this.focusRoot, this.referenceRect);
    }

    if (!nextElem) {
      const focusableElems = Array.from(root.querySelectorAll<HTMLElement>('[tabIndex]')).filter(
        el => !ignore.has(el) && this.isFocusable(el),
      );

      const finder = new ElementFinder(direction, refRect, focusableElems, this.prevElement);
      nextElem = finder.find();
    }
    return nextElem;
  }

  private triggerOnFocusHandlers(next: HTMLElement) {
    if (!this.root) {
      throw new Error('root not set');
    }
    const isAttached = this.selected !== null && this.root.contains(this.selected);
    if (!isAttached) {
      let elem: HTMLElement | null = next;
      while (elem !== null && elem !== this.root) {
        this.triggerFocusChange(elem, null);
        elem = elem.parentElement;
      }
      return;
    }

    // Find the common ancestor of the next and currently selected element.
    // Trigger focus changes on every element that we touch.
    const common = getCommonAncestor(next, this.selected);
    let el = this.selected;
    while (el !== common && el !== null) {
      this.triggerFocusChange(el, null);
      el = el.parentElement;
    }

    el = next;
    while (el !== common && el !== null) {
      this.triggerFocusChange(el, null);
      el = el.parentElement;
    }

    el = common;
    while (el !== this.root && el !== null) {
      this.triggerFocusChange(el, null);
      el = el.parentElement;
    }
  }

  private switchFocusClass(prevElem: HTMLElement | null, nextElem: HTMLElement, className: string) {
    if (className) {
      if (prevElem) {
        prevElem.classList.remove(className);
      }
      nextElem.classList.add(className);
    }
  }

  private triggerFocusChange(el: HTMLElement, next: HTMLElement | null) {
    const directive = this.registry.find(el);
    if (directive && directive.onFocus) {
      directive.onFocus(next);
    }
  }

  /**
   * Scrolls the page so that the selected element is visible.
   */
  private rescroll(el: HTMLElement, scrollSpeed: number | null, container: HTMLElement) {
    // Abort if scrolling is disabled.
    if (scrollSpeed === null) {
      return;
    }

    // Animation function to transition a scroll on the `parent` from the
    // `original` value to the `target` value by calling `set.
    const animate = (
      parentElement: HTMLElement,
      target: number,
      original: number,
      setter: (x: number) => void,
    ) => {
      if (scrollSpeed === Infinity) {
        parentElement.scrollTop = target;
        return;
      }

      const start = performance.now();
      const duration = (Math.abs(target - original) / scrollSpeed) * 1000;
      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setter(quad(original, target, progress));

        if (progress < 1) {
          requestAnimationFrame(run);
        }
      };

      requestAnimationFrame(run);
    };

    // The scroll calculation loop. Starts at the element and goes up, ensuring
    // that the element (or the box where the element will be after scrolling
    // is applied) is visible in all containers.
    const { width, height, top, left } = this.referenceRect;

    let parent = el.parentElement;
    while (parent != null && parent !== container.parentElement) {
      // Special case: treat the body as the viewport as far as scrolling goes.
      let prect: IReducedClientRect;
      if (parent === container) {
        const containerStyle = window.getComputedStyle(container, undefined);
        const paddingTop = containerStyle.paddingTop
          ? Number(containerStyle.paddingTop.slice(0, -2))
          : 0;
        const paddingBottom = containerStyle.paddingBottom
          ? Number(containerStyle.paddingBottom.slice(0, -2))
          : 0;
        const paddingLeft = containerStyle.paddingLeft
          ? Number(containerStyle.paddingLeft.slice(0, -2))
          : 0;
        const paddingRight = containerStyle.paddingRight
          ? Number(containerStyle.paddingRight.slice(0, -2))
          : 0;
        prect = {
          height: container.clientHeight - paddingTop - paddingBottom,
          left: paddingLeft,
          top: paddingTop,
          width: container.clientWidth - paddingLeft - paddingRight,
        };
      } else {
        prect = parent.getBoundingClientRect();
      }

      // Trigger if this element has a vertical scrollbar
      if (parent.scrollHeight > parent.clientHeight) {
        const scrollTop = parent.scrollTop;
        const showsTop = scrollTop + (top - prect.top);
        const showsBottom = showsTop + (height - prect.height);

        if (showsTop < scrollTop) {
          animate(parent, showsTop, scrollTop, x => ((parent as HTMLElement).scrollTop = x));
        } else if (showsBottom > scrollTop) {
          animate(parent, showsBottom, scrollTop, x => ((parent as HTMLElement).scrollTop = x));
        }
      }

      // Trigger if this element has a horizontal scrollbar
      if (parent.scrollWidth > parent.clientWidth) {
        const scrollLeft = parent.scrollLeft;
        const showsLeft = scrollLeft + (left - prect.left);
        const showsRight = showsLeft + (width - prect.width);

        if (showsLeft < scrollLeft) {
          animate(parent, showsLeft, scrollLeft, x => ((parent as HTMLElement).scrollLeft = x));
        } else if (showsRight > scrollLeft) {
          animate(parent, showsRight, scrollLeft, x => ((parent as HTMLElement).scrollLeft = x));
        }
      }
      parent = parent.parentElement;
    }
  }

  /**
   * Bubbles the ArcEvent from the currently selected element
   * to all parent arc directives.
   */
  private bubbleEvent(
    ev: ArcEvent,
    incoming: boolean,
    source: HTMLElement | null = this.selected,
  ): ArcEvent {
    for (
      let el = source;
      !(ev as any).propagationStopped && el !== this.root && el;
      el = el.parentElement
    ) {
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
      if (directive) {
        if (incoming && directive.onIncoming) {
          directive.onIncoming(ev);
        } else if (!incoming && directive.onOutgoing) {
          directive.onOutgoing(ev);
        }
      }
    }

    return ev;
  }

  /**
   * Returns if the element can receive focus.
   */
  private isFocusable(el: HTMLElement): boolean {
    if (el === this.selected) {
      return false;
    }
    // to prevent navigating to parent container elements with arc-focus-inside
    if (this.selected && el.contains(this.selected)) {
      return false;
    }

    // Dev note: el.tabindex is not consistent across browsers
    const tabIndex = el.getAttribute('tabIndex');
    if (!tabIndex || +tabIndex < 0) {
      return false;
    }

    const record = this.registry.find(el);
    if (record && record.excludeThis && record.excludeThis) {
      return false;
    }

    if (this.registry.hasExcludedDeepElements()) {
      let parent: HTMLElement | null = el;
      while (parent) {
        const parentRecord = this.registry.find(parent);
        if (parentRecord && parentRecord.exclude && parentRecord.exclude) {
          return false;
        }
        parent = parent.parentElement;
      }
    }

    return this.isVisible(el);
  }

  /**
   * Runs a final check, which can be more expensive, run only if we want to
   * set the element as our next preferred candidate for focus.
   */
  private checkFinalFocusable(el: HTMLElement): boolean {
    return this.isVisible(el);
  }

  private isVisible(el: HTMLElement | null) {
    if (!el) {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    return true;
  }

  /**
   * Reset the focus if arcade-machine wanders out of root
   */
  private setDefaultFocus(scrollSpeed: number | null = this.scrollSpeed) {
    const focusableElems = this.focusRoot.querySelectorAll('[tabIndex]');

    // tslint:disable-next-line
    for (let i = 0; i < focusableElems.length; i += 1) {
      const potentialElement = focusableElems[i] as HTMLElement;
      if (this.selected === potentialElement || !this.isFocusable(potentialElement)) {
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

  /**
   * findNextFocusByRaycast is a speedy implementation of focus searching
   * that uses a raycast to determine the next best element.
   */
  private findNextFocusByRaycast(
    direction: Direction,
    root: HTMLElement,
    referenceRect: ClientRect,
  ) {
    if (!this.selected) {
      this.setDefaultFocus();
    }
    if (!this.selected) {
      return null;
    }

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
      case Direction.Left:
        baseX = referenceRect.left - 1;
        baseY = referenceRect.top + referenceRect.height / 2;
        seekX = -1;
        break;
      case Direction.Right:
        baseX = referenceRect.left + referenceRect.width + 1;
        baseY = referenceRect.top + referenceRect.height / 2;
        seekX = 1;
        break;
      case Direction.Up:
        baseX = referenceRect.left + referenceRect.width / 2;
        baseY = referenceRect.top - 1;
        seekY = -1;
        break;
      case Direction.Down:
        baseX = referenceRect.left + referenceRect.width / 2;
        baseY = referenceRect.top + referenceRect.height + 1;
        seekY = 1;
        break;
      default:
        throw new Error('Invalid direction');
    }

    for (let i = 0; i < maxDistance; i += searchPointDistance) {
      const el = document.elementFromPoint(baseX + seekX * i, baseY + seekY * i) as HTMLElement;

      if (!el || el === this.selected) {
        continue;
      }

      if (!isNodeAttached(el, root) || !this.isFocusable(el) || !this.checkFinalFocusable(el)) {
        continue;
      }

      return el;
    }

    return null;
  }
}
