import { ArcEvent } from './arc-event';

/**
 * Direction is an enum of possible gamepad events which can fire.
 */
export const enum Direction {
  Submit = 0,
  Back = 1,
  X = 2,
  Y = 3,
  TabLeft = 4, // Left Bumper
  TabRight = 5, // Right Bumper
  TabUp = 6, // Left Trigger
  TabDown = 7, // Right Trigger
  View = 8, // Left small button, aka start
  Menu = 9, // Right small button
  Up = 12,
  Down = 13,
  Left = 14,
  Right = 15,
}

/**
 * The set of left/right/up/down directional buttons.
 */
export const directionalButtons: ReadonlySet<Direction> = new Set([
  Direction.Left,
  Direction.Right,
  Direction.Up,
  Direction.Down,
]);

/**
 * The set of gamepad buttons that aren't left/right/up/down focuses.
 */
export const nonDirectionalButtons: ReadonlySet<Direction> = new Set([
  Direction.Submit,
  Direction.Back,
  Direction.X,
  Direction.Y,
  Direction.TabLeft,
  Direction.TabRight,
  Direction.TabUp,
  Direction.TabDown,
  Direction.View,
  Direction.Menu,
]);

/**
 * Returns if the direction is left or right.
 */
export function isHorizontal(direction: Direction) {
  return direction === Direction.Left || direction === Direction.Right;
}

/**
 * Returns if the direction is up or down.
 */
export function isVertical(direction: Direction) {
  return direction === Direction.Up || direction === Direction.Down;
}

/**
 * Returns whether the button press is directional.
 */
export function isDirectional(direction: Direction) {
  return (
    direction === Direction.Up ||
    direction === Direction.Down ||
    direction === Direction.Left ||
    direction === Direction.Right
  );
}

export interface IArcHandler {
  /**
   * The associated DOM element.
   */
  readonly element: HTMLElement;

  /**
   * A method which can return "false" if this handler should not be
   * included as focusable.
   */
  readonly excludeThis?: boolean;

  /**
   * A method which can return "false" if this handler and all its children
   * should not be included as focusable.
   */
  readonly exclude?: boolean;

  /**
   * Element or selector which should be focused when navigating to
   * the left of this component.
   */
  readonly arcFocusLeft?: HTMLElement | string;

  /**
   * Element or selector which should be focused when navigating to
   * the right of this component.
   */
  readonly arcFocusRight?: HTMLElement | string;

  /**
   * Element or selector which should be focused when navigating to
   * above this component.
   */
  readonly arcFocusUp?: HTMLElement | string;

  /**
   * Element or selector which should be focused when navigating to
   * below this component.
   */
  readonly arcFocusDown?: HTMLElement | string;

  /**
   * If focused, the element transfers focus to its children if true
   */
  readonly arcFocusInside?: boolean;

  /**
   * Called with an IArcEvent focus is about
   * to leave this element or one of its children.
   */
  onOutgoing?(ev: ArcEvent): void;

  /**
   * Called with an IArcEvent focus is about
   * to enter this element or one of its children.
   */
  onIncoming?(ev: ArcEvent): void;

  /**
   * Triggers a focus change event.
   */
  onFocus?(el: HTMLElement | null): void;
}
