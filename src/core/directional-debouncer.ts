import { IDebouncer } from './gamepad';

const enum DebouncerStage {
  IDLE,
  HELD,
  FAST,
}

/**
 * DirectionalDebouncer debounces directional navigation like arrow keys,
 * handling "holding" states.
 */
export class DirectionalDebouncer implements IDebouncer {
  /**
   * Initial debounce after a joystick is pressed before beginning shorter
   * press debouncded.
   */
  public static initialDebounce = 500;

  /**
   * Fast debounce time for joysticks when they're being held in a direction.
   */
  public static fastDebounce = 150;

  /**
   * The time that the debounce was initially started.
   */
  private heldAt = 0;

  /**
   * Current state of the debouncer.
   */
  private stage = DebouncerStage.IDLE;

  constructor(private predicate: () => boolean) {}

  /**
   * Returns whether the key should be registered as pressed.
   */
  public attempt(now: number): boolean {
    const result = this.predicate();
    if (!result) {
      this.stage = DebouncerStage.IDLE;
      return false;
    }

    switch (this.stage) {
      case DebouncerStage.IDLE:
        this.stage = DebouncerStage.HELD;
        this.heldAt = now;
        return true;

      case DebouncerStage.HELD:
        if (now - this.heldAt < DirectionalDebouncer.initialDebounce) {
          return false;
        }
        this.heldAt = now;
        this.stage = DebouncerStage.FAST;
        return true;

      case DebouncerStage.FAST:
        if (now - this.heldAt < DirectionalDebouncer.fastDebounce) {
          return false;
        }
        this.heldAt = now;
        return true;

      default:
        throw new Error(`Unknown debouncer stage ${this.stage}!`);
    }
  }
}
