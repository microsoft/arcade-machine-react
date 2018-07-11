import { fromEvent, merge, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { keys } from 'uwp-keycodes';

import { ArcEvent } from './arc-event';
import { IGamepadWrapper } from './core/gamepad';
import { XboxGamepadWrapper } from './core/xbox-gamepad';
import { FocusService } from './focus-service';
import { Direction, nonDirectionalButtons } from './model';

/**
 * Based on the currently focused DOM element, returns whether the directional
 * input is part of a form control and should be allowed to bubble through.
 */
function isForForm(direction: Direction, selected: HTMLElement | null): boolean {
  if (!selected) {
    return false;
  }

  // Always allow the browser to handle enter key presses in a form or text area.
  if (direction === Direction.Submit) {
    let parent: HTMLElement | null = selected;
    while (parent) {
      if (
        parent.tagName === 'FORM' ||
        parent.tagName === 'TEXTAREA' ||
        (parent.tagName === 'INPUT' && (parent as HTMLInputElement).type !== 'button')
      ) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  // Okay, not a submission? Well, if we aren't inside a text input, go ahead
  // and let arcade-machine try to deal with the output.
  const tag = selected.tagName;
  if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
    return false;
  }

  // We'll say that up/down has no effect.
  if (direction === Direction.Down || direction === Direction.Up) {
    return false;
  }

  // Deal with the output ourselves, allowing arcade-machine to handle it only
  // if the key press would not have any effect in the context of the input.
  const input = selected as HTMLInputElement | HTMLTextAreaElement;
  const { type } = input;
  if (
    type !== 'text' &&
    type !== 'search' &&
    type !== 'url' &&
    type !== 'tel' &&
    type !== 'password'
  ) {
    return false;
  }

  const cursor = input.selectionStart;
  if (cursor !== input.selectionEnd) {
    // key input on any range selection will be effectual.
    return true;
  }

  if (cursor === null) {
    return false;
  }

  return (
    (cursor > 0 && direction === Direction.Left) ||
    (cursor > 0 && direction === Direction.Back) ||
    (cursor < input.value.length && direction === Direction.Right)
  );
}

export interface IWindowsInputPane {
  tryShow(): void;
}

/**
 * InputService handles passing input from the external device (gamepad API
 * or keyboard) to the arc internals.
 */
export class InputService {
  public get keyboardVisible(): boolean {
    if (!this.inputPane) {
      return false;
    }

    return this.inputPane.occludedRect.y !== 0 || this.inputPane.visible;
  }

  /**
   * codeToDirection returns a direction from keyCode
   */
  public codeDirectionMap = new Map<number, Direction>([
    [keys.LeftArrow, Direction.Left],
    [keys.GamepadLeftThumbstickLeft, Direction.Left],
    [keys.GamepadDPadLeft, Direction.Left],
    [keys.NavigationLeft, Direction.Left],

    [keys.RightArrow, Direction.Right],
    [keys.GamepadLeftThumbstickRight, Direction.Right],
    [keys.GamepadDPadRight, Direction.Right],
    [keys.NavigationRight, Direction.Right],

    [keys.UpArrow, Direction.Up],
    [keys.GamepadLeftThumbstickUp, Direction.Up],
    [keys.GamepadDPadUp, Direction.Up],
    [keys.NavigationUp, Direction.Up],

    [keys.DownArrow, Direction.Down],
    [keys.GamepadLeftThumbstickDown, Direction.Down],
    [keys.GamepadDPadDown, Direction.Down],
    [keys.NavigationDown, Direction.Down],

    [keys.Enter, Direction.Submit],
    [keys.NavigationAccept, Direction.Submit],
    [keys.GamepadA, Direction.Submit],

    [keys.Escape, Direction.Back],
    [keys.GamepadB, Direction.Back],

    [keys.Numpad7, Direction.X],
    [keys.GamepadX, Direction.X],
    [keys.Numpad9, Direction.Y],
    [keys.GamepadY, Direction.Y],

    [keys.Numpad4, Direction.TabLeft],
    [keys.GamepadLeftShoulder, Direction.TabLeft],
    [keys.Numpad6, Direction.TabRight],
    [keys.GamepadRightShoulder, Direction.TabRight],
    [keys.Numpad8, Direction.TabUp],
    [keys.GamepadLeftTrigger, Direction.TabUp],
    [keys.Numpad2, Direction.TabDown],
    [keys.GamepadRightTrigger, Direction.TabDown],

    [keys.Divide, Direction.View],
    [keys.GamepadView, Direction.View],
    [keys.Multiply, Direction.Menu],
    [keys.GamepadMenu, Direction.Menu],
  ]);

  /**
   * Mock source for gamepad connections. You can provide gamepads manually
   * here, but this is mostly for testing purposes.
   */
  public gamepadSrc = new Subject<{ gamepad: Gamepad }>();

  /**
   * Mock source for keyboard events. You can provide events manually
   * here, but this is mostly for testing purposes.
   */
  public keyboardSrc = new Subject<{
    defaultPrevented: boolean;
    keyCode: number;
    preventDefault: () => void;
  }>();

  /**
   * Inputpane and boolean to indicate whether it's visible
   */
  private inputPane = (() => {
    try {
      return Windows.UI.ViewManagement.InputPane.getForCurrentView();
    } catch (e) {
      return null;
    }
  })();

  private gamepads: { [key: string]: IGamepadWrapper } = {};
  private subscriptions: Subscription[] = [];
  private pollRaf: number | null = null;
  private emitters = new Map<Direction, Subject<ArcEvent>>();

  constructor(private focus: FocusService) {}

  /**
   * Gets the (global) ArcEvent emitter for a direction
   */
  public getDirectionEmitter(direction: Direction): Subject<ArcEvent> | undefined {
    return this.emitters.get(direction);
  }

  /**
   * Bootstrap attaches event listeners from the service to the DOM and sets
   * up the focuser rooted in the target element.
   */
  public bootstrap(root: HTMLElement = document.body) {
    nonDirectionalButtons.forEach(num => this.emitters.set(num, new Subject<ArcEvent>()));

    // The gamepadInputEmulation is a string property that exists in
    // JavaScript UWAs and in WebViews in UWAs. It won't exist in
    // Win8.1 style apps or browsers.
    if ('gamepadInputEmulation' in navigator) {
      // We want the gamepad to provide gamepad VK keyboard events rather than moving a
      // mouse like cursor. The gamepad will provide such keyboard events and provide
      // input to the DOM
      navigator.gamepadInputEmulation = 'keyboard';
    } else if ('getGamepads' in navigator) {
      // Poll connected gamepads and use that for input if keyboard emulation isn't available
      this.watchForGamepad();
    }

    this.addKeyboardListeners();
    this.focus.setRoot(root, this.focus.scrollSpeed);

    this.subscriptions.push(
      fromEvent<FocusEvent>(document, 'focusin')
        .pipe(filter(ev => ev.target !== this.focus.selected))
        .subscribe(ev => {
          this.focus.onFocusChange(ev.target as HTMLElement, this.focus.scrollSpeed);
        }),
    );
  }

  /**
   * Unregisters all listeners and frees resources associated with the service.
   */
  public teardown() {
    this.focus.teardown();
    this.gamepads = {};
    if (this.pollRaf) {
      cancelAnimationFrame(this.pollRaf);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if ('gamepadInputEmulation' in navigator) {
      (navigator as any).gamepadInputEmulation = 'mouse';
    }
  }

  public setRoot(root: HTMLElement) {
    this.focus.setRoot(root, this.focus.scrollSpeed);
  }

  /**
   * Handles a direction event, returns whether the event has been handled
   */
  public handleDirection(direction: Direction): boolean {
    let dirHandled: boolean;
    const ev = this.focus.createArcEvent(direction);
    const forForm = isForForm(direction, this.focus.selected);
    dirHandled = !forForm && this.bubbleDirection(ev);

    const dirEmitter = this.emitters.get(direction);
    if (dirEmitter) {
      dirEmitter.next(ev);
    }

    if (!forForm && !dirHandled) {
      return this.focus.defaultFires(ev);
    }

    return false;
  }

  /**
   * Detects any connected gamepads and watches for new ones to start
   * polling them. This is the entry point for gamepad input handling.
   */
  private watchForGamepad() {
    const addGamepad = (pad: Gamepad | null) => {
      let gamepad: IGamepadWrapper | null = null;
      if (pad === null) {
        return;
      }
      if (/xbox/i.test(pad.id)) {
        gamepad = new XboxGamepadWrapper(pad);
      }
      if (!gamepad) {
        // We can try, at least ¯\_(ツ)_/¯ and this should
        // usually be OK due to remapping.
        gamepad = new XboxGamepadWrapper(pad);
      }

      this.gamepads[pad.id] = gamepad;
    };

    Array.from(navigator.getGamepads())
      .filter(pad => !!pad)
      .forEach(addGamepad);

    if (Object.keys(this.gamepads).length > 0) {
      this.scheduleGamepadPoll();
    }

    this.subscriptions.push(
      merge(this.gamepadSrc, fromEvent(window, 'gamepadconnected')).subscribe(ev => {
        addGamepad((ev as any).gamepad);
        if (this.pollRaf) {
          cancelAnimationFrame(this.pollRaf);
        }
        this.scheduleGamepadPoll();
      }),
    );
  }

  /**
   * Schedules a new gamepad poll at the next animation frame.
   */
  private scheduleGamepadPoll() {
    this.pollRaf = requestAnimationFrame(now => {
      this.pollGamepad(now);
    });
  }

  /**
   * Checks for input provided by the gamepad and fires off events as
   * necessary. It schedules itself again provided that there's still
   * a connected gamepad somewhere.
   */
  private pollGamepad(now: number) {
    for (const pad of navigator.getGamepads()) {
      if (pad === null) {
        continue;
      }
      const gamepad = this.gamepads[pad.id];
      if (!gamepad) {
        continue;
      }
      gamepad.pad = pad;

      if (!gamepad.isConnected()) {
        delete this.gamepads[pad.id];
        continue;
      }

      if (this.keyboardVisible) {
        continue;
      }

      nonDirectionalButtons.forEach(dir => {
        const gamepadEvt = gamepad.events.get(dir);
        if (gamepadEvt && gamepadEvt(now)) {
          this.handleDirection(dir);
        }
      });
    }

    if (Object.keys(this.gamepads).length > 0) {
      this.scheduleGamepadPoll();
    } else {
      this.pollRaf = null;
    }
  }

  private bubbleDirection(ev: ArcEvent): boolean {
    const event = ev.event;
    if (
      event === Direction.Up ||
      event === Direction.Right ||
      event === Direction.Down ||
      event === Direction.Left ||
      event === Direction.Submit ||
      event === Direction.Back
    ) {
      return this.focus.bubble(ev);
    }
    return false;
  }

  /**
   * Handles a key down event, returns whether the event has resulted
   * in a navigation and should be cancelled.
   */
  private handleKeyDown(keyCode: number): boolean {
    const direction = this.codeDirectionMap.get(keyCode);
    return direction === undefined ? false : this.handleDirection(direction);
  }

  /**
   * Adds listeners for keyboard events.
   */
  private addKeyboardListeners() {
    this.subscriptions.push(
      merge(this.keyboardSrc, fromEvent<KeyboardEvent>(window, 'keydown')).subscribe(ev => {
        if (!ev.defaultPrevented && this.handleKeyDown(ev.keyCode)) {
          ev.preventDefault();
        }
      }),
    );
  }
}
