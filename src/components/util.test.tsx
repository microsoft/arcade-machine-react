import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { FocusContext } from '../focus';
import { Button } from '../model';
import { instance } from '../singleton';

const container = document.createElement('div');
document.body.appendChild(container);

let mountings: ReactWrapper[] = [];

/**
 * mountToDOM is Enzyme's mount function that attaches the element to the
 * document, which Enzyme doesn't do by default. This is needed for many
 * focus tests, as the browser won't focus an element not attached to
 * the document.
 */
export function mountToDOM(element: React.ReactElement<any>) {
  const wrapper = mount(element, { attachTo: container });
  mountings.push(wrapper);
  return wrapper;
}

export function unmountAll() {
  mountings.forEach(m => m.unmount());
  mountings = [];
}

afterEach(() => {
  unmountAll();
  instance.setServices(undefined);
});

/**
 * Focus context for use in tests.
 */
export class NoopFocusContext extends FocusContext {
  constructor() {
    super(container, Button.Down, [], {
      activeElement: document.body,
      directive: undefined,
      referenceRect: document.body.getBoundingClientRect(),
    });
  }
}
