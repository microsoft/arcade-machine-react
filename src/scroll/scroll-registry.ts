export interface IScrollableContainer {
  element: HTMLElement;
  horizontal: boolean;
  vertical: boolean;
}

/**
 * The ScrollRegistry keeps tracks of what elements are registered as
 * being scrollable.
 */
export class ScrollRegistry {
  constructor(
    private readonly containers: Array<Readonly<IScrollableContainer>> = [
      {
        element: (document.scrollingElement as HTMLElement) || document.body,
        horizontal: false,
        vertical: true,
      },
    ],
  ) {}

  /**
   * Registers the element as being an arcade-machine scroll container.
   */
  public add(data: Readonly<IScrollableContainer>) {
    this.containers.push(data);
  }

  /**
   * Registers the element as being an arcade-machine scroll container.
   */
  public remove(el: HTMLElement) {
    this.containers.splice(this.containers.findIndex(r => r.element === el), 1);
  }

  /**
   * Returns the list of registered scroll containers.
   */
  public getScrollContainers(): ReadonlyArray<Readonly<IScrollableContainer>> {
    return this.containers;
  }
}
