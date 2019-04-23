import { ArcEvent } from './arc-event';

/**
 * Looks for the element by its selector, if given, or returns it.
 */
export const findElement = (container: HTMLElement, target?: string | HTMLElement) =>
  target
    ? typeof target === 'string'
      ? (container.querySelector(target) as HTMLElement | null)
      : target
    : null;

/**
 * Returns the focusable element in the container, optionally filtering
 * to the given target.
 */
export const findFocusable = (container: HTMLElement, target?: string | HTMLElement) =>
  findElement(container, target) || (container.querySelector('[tabIndex]') as HTMLElement | null);

/**
 * returns whether stopPropogation has been called on the event.
 */
export function propogationStoped(ev: ArcEvent) {
  return (ev as any).propogationStopped;
}

/**
 * resets state (propogation and default prevention) of the event.
 */
export function resetEvent(ev: ArcEvent) {
  (ev as any).propogationStopped = false;
  (ev as any).defaultPrevented = false;
}
