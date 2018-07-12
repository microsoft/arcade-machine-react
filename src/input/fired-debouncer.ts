/**
 * FiredDebouncer handles single "fired" states that happen from button presses.
 */
export class FiredDebouncer {
  private fired = false;

  constructor(private predicate: () => boolean) {}

  /**
   * Returns whether the key should be registered as pressed.
   */
  public attempt(): boolean {
    const result = this.predicate();
    const hadFired = this.fired;
    this.fired = result;

    return !hadFired && result;
  }
}
