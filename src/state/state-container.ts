import { IArcHandler } from '../model';
import { ElementStateRecord } from './element-state-record';

/**
 * One StateContainer is held per arcade-machine instance, and provided
 * in the context to lower components. It allows components to register
 * and unregister themselves to hook into events and customize how focus
 * is dealt with.
 */
export class StateContainer {
  /**
   * Mapping of HTML elements to options set on those elements.
   */
  private readonly arcs = new Map<HTMLElement, ElementStateRecord>();

  /**
   * Stores a directive into the registry.
   */
  public add(key: any, arc: IArcHandler) {
    const record = this.arcs.get(arc.element);
    if (record) {
      record.add(key, arc);
    } else {
      this.arcs.set(arc.element, new ElementStateRecord(key, arc));
    }
  }

  /**
   * Removes a directive from the registry.
   */
  public remove(key: any, el: HTMLElement) {
    const record = this.arcs.get(el);
    if (!record) {
      return;
    }

    record.remove(key);

    if (!record.resolved) {
      this.arcs.delete(el);
    }
  }

  /**
   * Returns the ArcDirective associated with the element. Returns
   * undefined if the element has no associated arc.
   */
  public find(el: HTMLElement): Readonly<IArcHandler> | undefined {
    const record = this.arcs.get(el);
    if (!record) {
      return undefined;
    }
    return record.resolved;
  }

  /**
   * Returns whether the given element exists in the arcade-machine state.
   */
  public has(el: HTMLElement): boolean {
    return this.arcs.has(el);
  }
}
