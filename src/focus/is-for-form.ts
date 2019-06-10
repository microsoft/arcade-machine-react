import { Button } from '../model';

/**
 * Based on the currently focused DOM element, returns whether the directional
 * input is part of a form control and should be allowed to bubble through.
 */
export function isForForm(direction: Button, selected: HTMLElement | null): boolean {
  if (!selected) {
    return false;
  }

  // Always allow the browser to handle enter key presses in a form or text area.
  if (direction === Button.Submit) {
    let parent: HTMLElement | null = selected;
    while (parent) {
      if (
        parent.tagName === 'FORM' ||
        parent.tagName === 'TEXTAREA' ||
        (parent.tagName === 'INPUT' &&
          (parent as HTMLInputElement).type !== 'button' &&
          (parent as HTMLInputElement).type !== 'checkbox' &&
          (parent as HTMLInputElement).type !== 'radio')
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
  if (direction === Button.Down || direction === Button.Up) {
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
    type !== 'password' &&
    type !== 'textarea'
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
    (cursor > 0 && direction === Button.Left) ||
    (cursor > 0 && direction === Button.Back) ||
    (cursor < input.value.length && direction === Button.Right)
  );
}
