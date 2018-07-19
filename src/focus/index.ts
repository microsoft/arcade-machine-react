import { Button, IArcHandler } from '../model';

export interface IFocusOptions {
  /**
   * The direction the focus is going.
   */
  direction: Button;

  /**
   * Root of the arcade-machine focus tree.
   */
  root: HTMLElement;

  /**
   * The current element that is focused.
   */
  activeElement: HTMLElement;

  /**
   * The last element that was focused.
   */
  previousElement: HTMLElement;

  /**
   * The position of the last selected element.
   */
  referenceRect: ClientRect;

  /**
   * Elements to exclude from the ones to find.
   */
  ignore: ReadonlySet<HTMLElement>;

  /**
   * The handler for the selected element, if any.
   */
  directive?: Readonly<IArcHandler>;
}

/**
 * The IElementStore holds which item is currently in focus on the page.
 * The focus servers will get *and set* the element to trigger focus changes.
 */
export interface IElementStore {
  element: HTMLElement;
}

/**
 * The FocusContext is created for each focus change operation. It contains
 * the direction the focus is shifting, and the currently selected element
 * along with the reference rectangle. It can then be used to query for
 * focusable elements.
 */
export class FocusContext {
  constructor(
    private readonly defaultRoot: HTMLElement,
    private readonly direction: Button,
    private readonly strategies: IFocusStrategy[],
    private readonly source: {
      activeElement: HTMLElement;
      directive?: Readonly<IArcHandler>;
      referenceRect: ClientRect;
      previousElement?: HTMLElement;
    },
  ) {}

  /**
   * Find attempts to look for the next best focusable element within the
   * given focus root.
   */
  public find(
    root: HTMLElement = this.defaultRoot,
    ignore: ReadonlySet<HTMLElement> = new Set(),
  ): HTMLElement | null {
    const options: IFocusOptions = {
      previousElement: this.source.activeElement,
      ...this.source,
      direction: this.direction,
      ignore,
      root,
    };

    for (const strategy of this.strategies) {
      const selection = strategy.findNextFocus(options);
      if (selection) {
        return selection;
      }
    }

    return null;
  }
}

/**
 * IFocusStrategy is a method of finding the next focusable element. Used
 * within the focus service.
 */
export interface IFocusStrategy {
  findNextFocus(options: IFocusOptions): HTMLElement | null;
}
