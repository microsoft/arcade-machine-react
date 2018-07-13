import { fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { keys } from 'uwp-keycodes';

import { Button } from '../model';
import { IInputMethod } from './input-method';

export class KeyboardInput implements IInputMethod {
  /**
   * codeToDirection returns a direction from keyCode
   */
  public static readonly codeDirectionMap = new Map<number, Button>([
    [keys.LeftArrow, Button.Left],
    [keys.GamepadLeftThumbstickLeft, Button.Left],
    [keys.GamepadDPadLeft, Button.Left],
    [keys.NavigationLeft, Button.Left],

    [keys.RightArrow, Button.Right],
    [keys.GamepadLeftThumbstickRight, Button.Right],
    [keys.GamepadDPadRight, Button.Right],
    [keys.NavigationRight, Button.Right],

    [keys.UpArrow, Button.Up],
    [keys.GamepadLeftThumbstickUp, Button.Up],
    [keys.GamepadDPadUp, Button.Up],
    [keys.NavigationUp, Button.Up],

    [keys.DownArrow, Button.Down],
    [keys.GamepadLeftThumbstickDown, Button.Down],
    [keys.GamepadDPadDown, Button.Down],
    [keys.NavigationDown, Button.Down],

    [keys.Enter, Button.Submit],
    [keys.NavigationAccept, Button.Submit],
    [keys.GamepadA, Button.Submit],

    [keys.Escape, Button.Back],
    [keys.GamepadB, Button.Back],

    [keys.Numpad7, Button.X],
    [keys.GamepadX, Button.X],
    [keys.Numpad9, Button.Y],
    [keys.GamepadY, Button.Y],

    [keys.Numpad4, Button.TabLeft],
    [keys.GamepadLeftShoulder, Button.TabLeft],
    [keys.Numpad6, Button.TabRight],
    [keys.GamepadRightShoulder, Button.TabRight],
    [keys.Numpad8, Button.TabUp],
    [keys.GamepadLeftTrigger, Button.TabUp],
    [keys.Numpad2, Button.TabDown],
    [keys.GamepadRightTrigger, Button.TabDown],

    [keys.Divide, Button.View],
    [keys.GamepadView, Button.View],
    [keys.Multiply, Button.Menu],
    [keys.GamepadMenu, Button.Menu],
  ]);

  public readonly observe = fromEvent<KeyboardEvent>(window, 'keydown').pipe<{
    button: Button;
    event: Event;
  }>(
    map(event => {
      const button = KeyboardInput.codeDirectionMap.get(event.keyCode);
      if (button === undefined) {
        return undefined;
      }

      return { button, event };
    }),
    filter(ev => ev !== undefined),
  );

  public readonly isSupported = true;
}
