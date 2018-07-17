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
   * Ref counter for the number of components that use the exclude()
   * option. This results in more expensive lookup operations, so we avoid
   * doing it so if there's no one requesting exclusion.
   */
  private excludedDeepCount = 0;

  /**
   * Stores a directive into the registry.
   */
  public add(key: any, arc: IArcHandler) {
    const record = this.arcs.get(arc.element);
    if (!record) {
      this.arcs.set(arc.element, new ElementStateRecord(key, arc));
      if (arc.exclude) {
        this.excludedDeepCount++;
      }
      return;
    }

    const hadExclusion = record.resolved!.exclude;
    record.add(key, arc);
    if (record.resolved!.exclude && !hadExclusion) {
      this.excludedDeepCount++;
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

    const hadExclusion = record.resolved!.exclude;
    record.remove(key);
    const hasExclusion = record.resolved && record.resolved.exclude;
    if (!record.resolved) {
      this.arcs.delete(el);
    }

    if (hadExclusion && !hasExclusion) {
      this.excludedDeepCount--;
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
   * Returns whether there are any elements with deep exclusions in the registry.
   */
  public hasExcludedDeepElements(): boolean {
    return this.excludedDeepCount > 0;
  }
}
