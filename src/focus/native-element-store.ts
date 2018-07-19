import { IElementStore } from '.';

/**
 * NativeElementStore is an IElementStore that uses the browser's native focus
 * for dealing with the focused element.
 */
export class NativeElementStore implements IElementStore {
  public get element() {
    return document.activeElement as HTMLElement;
  }

  public set element(element: HTMLElement) {
    element.focus();
  }
}
