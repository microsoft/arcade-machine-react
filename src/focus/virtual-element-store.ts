import { IElementStore } from '.';

const defaultNeedsNativeFocus = (element: HTMLElement) => {
  return element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' || element.isContentEditable;
};

/**
 * VirtualElementStore is an IElementStore that just keeps the focused element
 * in memory, and does not use the native dom focus.
 */
export class VirtualElementStore implements IElementStore {
  public get element() {
    return document.body.contains(this.previousElement)
      ? this.previousElement
      : (document.activeElement as HTMLElement);
  }

  public set element(element: HTMLElement) {
    this.previousElement.classList.remove('arc-selected');
    element.classList.add('arc-selected');

    const needsFocus = this.needsNativeFocus(element);
    if (needsFocus) {
      element.focus();
    } else if (this.gaveNativeFocus) {
      this.previousElement.blur();
    }

    this.gaveNativeFocus = needsFocus;
    this.previousElement = element;
  }

  private previousElement: HTMLElement = document.activeElement as HTMLElement;
  private gaveNativeFocus = false;
  constructor(
    private readonly needsNativeFocus: (element: HTMLElement) => boolean = defaultNeedsNativeFocus,
  ) {}
}
