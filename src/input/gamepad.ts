import { Button } from '../model';

export interface IGamepadWrapper {
  /**
   * Map from a direction to a function that takes in a time (now)
   * and returns whether that direction fired
   */
  readonly events: Map<Button, (now: number) => boolean>;

  /**
   * The actual Gamepad object that can be updated/accessed;
   */
  pad: Gamepad;

  /**
   * Returns whether the gamepad is still connected;
   */
  isConnected(): boolean;
}

/**
 * IDebouncer should be called whenever an input is held down. It returns
 * whether that input should fire a nevigational event.
 */
export interface IDebouncer {
  /**
   * Called with the current time, determines whether to fire a navigational
   * event.
   */
  attempt(node: number): boolean;
}
