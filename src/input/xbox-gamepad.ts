import { Button, nonDirectionalButtons } from '../model';
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
  public events = new Map<Button, (now: number) => boolean>();

  constructor(public pad: Gamepad) {
    const left = new DirectionalDebouncer(() => {
      /* left joystick                                 */
      return (
        this.pad.axes[0] < -XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Button.Left].pressed
      );
    });
    const right = new DirectionalDebouncer(() => {
      /* right joystick                               */
      return (
        this.pad.axes[0] > XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Button.Right].pressed
      );
    });
    const up = new DirectionalDebouncer(() => {
      /* up joystick                                   */
      return (
        this.pad.axes[1] < -XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Button.Up].pressed
      );
    });
    const down = new DirectionalDebouncer(() => {
      /* down joystick                                */
      return (
        this.pad.axes[1] > XboxGamepadWrapper.joystickThreshold ||
        this.pad.buttons[Button.Down].pressed
      );
    });

    this.events.set(Button.Left, now => left.attempt(now));
    this.events.set(Button.Right, now => right.attempt(now));
    this.events.set(Button.Up, now => up.attempt(now));
    this.events.set(Button.Down, now => down.attempt(now));

    for (const button of nonDirectionalButtons) {
      const debouncer = new FiredDebouncer(() => this.pad.buttons[button].pressed);
      this.events.set(button, () => debouncer.attempt());
    }
  }

  public isConnected() {
    return this.pad.connected;
  }
}
