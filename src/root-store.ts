/**
 * Holds the current root element.
 */
export class RootStore {
  private readonly roots: HTMLElement[];

  constructor(root: HTMLElement) {
    this.roots = [root];
  }

  public get element() {
    return this.roots[this.roots.length - 1];
  }

  /**
   * Scopes to the given new root.
   */
  public narrow(root: HTMLElement) {
    this.roots.push(root);
  }

  /**
   * Restores a scoped element.
   */
  public restore(fromRoot: HTMLElement) {
    const index = this.roots.lastIndexOf(fromRoot);
    if (index < 1) {
      // tslint:disable-next-line
      console.warn('arcade-machine: attempted to release a root we did not own');
    }

    this.roots.splice(index, 1);
  }
}
