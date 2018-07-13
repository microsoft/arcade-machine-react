import { fromEvent, Observable } from 'rxjs';

import { Button, buttons } from '../model';
import { IGamepadWrapper } from './gamepad';
import { IInputMethod } from './input-method';
import { XboxGamepadWrapper } from './xbox-gamepad';

/**
 * The GamepadInput reads input from any connected gamepads and translates
 * them into button presses.
 */
export class GamepadInput implements IInputMethod {
  /**
   * Detects any connected gamepads and watches for new ones to start
   * polling them. This is the entry point for gamepad input handling.
   */
  public readonly observe = new Observable<{ button: Button }>(subscriber => {
    if (this.attemptToActivateUwpKeyboardMapping()) {
      return () => (navigator.gamepadInputEmulation = 'mouse');
    }

    const gamepads: { [id: string]: IGamepadWrapper } = {};
    const addSub = fromEvent<GamepadEvent>(window, 'gamepadconnected').subscribe(
      ev => (gamepads[ev.gamepad.id] = this.wrapGamepad(ev.gamepad)),
    );
    const removeSub = fromEvent<GamepadEvent>(window, 'gamepaddisconnected').subscribe(
      ev => delete gamepads[ev.gamepad.id],
    );

    const poll = (now: number) => {
      const button = this.pollGamepad(now, gamepads);
      if (button !== null) {
        subscriber.next({ button });
      }
      raf = requestAnimationFrame(poll);
    };

    let raf = requestAnimationFrame(poll);

    return () => {
      addSub.unsubscribe();
      removeSub.unsubscribe();
      cancelAnimationFrame(raf);
    };
  });

  public readonly isSupported = 'gamepadInputEmulation' in navigator || 'getGamepads' in navigator;

  /**
   * Inputpane and boolean to indicate whether it's visible
   */
  private inputPane = (() => {
    try {
      return Windows.UI.ViewManagement.InputPane.getForCurrentView();
    } catch (ignored) {
      return null;
    }
  })();

  /**
   * Returns whether the Xbox virtual keyboard is visible.
   */
  private get keyboardVisible(): boolean {
    if (!this.inputPane) {
      return false;
    }

    return this.inputPane.occludedRect.y !== 0 || this.inputPane.visible;
  }

  private wrapGamepad(gamepad: Gamepad) {
    if (/xbox/i.test(gamepad.id)) {
      return new XboxGamepadWrapper(gamepad);
    }

    // We can try, at least ¯\_(ツ)_/¯ and this should
    // usually be OK due to remapping.
    return new XboxGamepadWrapper(gamepad);
  }

  /**
   * The gamepadInputEmulation is a string property that exists in
   * JavaScript UWAs and in WebViews in UWAs to automatically map controller
   * input to the keyboard. This method attempts to activate it,
   * and returns whether it can do so.
   */
  private attemptToActivateUwpKeyboardMapping() {
    // The gamepadInputEmulation is a string property that exists in
    // JavaScript UWAs and in WebViews in UWAs. It won't exist in
    // Win8.1 style apps or browsers.
    if (!('gamepadInputEmulation' in navigator)) {
      return false;
    }

    // We want the gamepad to provide gamepad VK keyboard events rather than moving a
    // mouse like cursor. The gamepad will provide such keyboard events and provide
    // input to the DOM
    navigator.gamepadInputEmulation = 'keyboard';
    return true;
  }

  /**
   * Checks for input provided by the gamepad and fires off events as
   * necessary. It schedules itself again provided that there's still
   * a connected gamepad somewhere.
   */
  private pollGamepad(now: number, gamepads: { [id: string]: IGamepadWrapper }): Button | null {
    if (this.keyboardVisible) {
      return null;
    }

    for (const pad of navigator.getGamepads()) {
      if (pad === null) {
        continue;
      }
      const gamepad = gamepads[pad.id];
      if (!gamepad) {
        continue;
      }

      gamepad.pad = pad;
      for (const button of buttons) {
        const gamepadEvt = gamepad.events.get(button);
        if (gamepadEvt && gamepadEvt(now)) {
          return button;
        }
      }
    }

    return null;
  }
}
