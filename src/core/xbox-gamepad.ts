import { Direction, nonDirectionalButtons } from '../model';
import { DirectionalDebouncer } from './directional-debouncer';
import { FiredDebouncer } from './fired-debouncer';
import { IGamepadWrapper } from './gamepad';

/**
 * XboxGamepadWrapper wraps an Xbox controller input for arcade-machine.
 */
export class XboxGamepadWrapper implements IGamepadWrapper {
  /**
   * Magnitude that joysticks have to go in one direction to be translated
   * into a direction key press.
   */
  public static joystickThreshold = 0.5;

  /**
   * Map from Direction to a function that takes a time (now) and returns
   * whether that direction fired
   */
  public events = new Map<Direction, (now: number) => boolean>();

  constructor(public pad: Gamepad) {
    const left = new DirectionalDebouncer(() => {
      /* left joystick                                 */
      return (
        this.pad.axes[0] < -XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Direction.Left].pressed
      );
    });
    const right = new DirectionalDebouncer(() => {
      /* right joystick                               */
      return (
        this.pad.axes[0] > XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Direction.Right].pressed
      );
    });
    const up = new DirectionalDebouncer(() => {
      /* up joystick                                   */
      return (
        this.pad.axes[1] < -XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Direction.Up].pressed
      );
    });
    const down = new DirectionalDebouncer(() => {
      /* down joystick                                */
      return (
        this.pad.axes[1] > XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Direction.Down].pressed
      );
    });

    this.events.set(Direction.Left, now => left.attempt(now));
    this.events.set(Direction.Right, now => right.attempt(now));
    this.events.set(Direction.Up, now => up.attempt(now));
    this.events.set(Direction.Down, now => down.attempt(now));

    for (const button of nonDirectionalButtons) {
      this.events.set(button, () =>
        new FiredDebouncer(() => this.pad.buttons[button].pressed).attempt(),
      );
    }
  }

  public isConnected() {
    return this.pad.connected;
  }
}
