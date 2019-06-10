import { expect } from 'chai';
import * as React from 'react';

import { ArcFocusEvent } from '../arc-focus-event';
import { NativeElementStore } from '../focus/native-element-store';
import { Button } from '../model';
import { instance } from '../singleton';
import { StateContainer } from '../state/state-container';
import { FocusArea } from './arc-focus-area';
import { mountToDOM, NoopFocusContext } from './util.test';

describe('ArcFocusArea', () => {
  const render = (focusIn?: string) => {
    const state = new StateContainer();
    instance.setServices({
      elementStore: new NativeElementStore(),
      stateContainer: state,
    });

    const contents = mountToDOM(
      <div>
        <FocusArea focusIn={focusIn}>
          <div className="a" />
          <div className="b" tabIndex={0} />
          <div className="c" tabIndex={0} />
        </FocusArea>
      </div>,
    );

    const element = contents.getDOMNode().querySelector('div') as HTMLElement;
    const record = state.find(element)!;
    expect(record).to.not.be.undefined;

    return {
      contents,
      element,
      record,
      state,
    };
  };

  it('focuses the first focusable element by default', () => {
    const { record, element } = render();

    const event = new ArcFocusEvent({
      context: new NoopFocusContext(),
      directive: undefined,
      event: Button.Down,
      next: element,
      target: document.body,
    });

    record.onIncoming!(event);

    expect(event.next!.className).to.equal('b');
  });

  it('overrides focusable by a query', () => {
    const { record, element } = render('.c');

    const event = new ArcFocusEvent({
      context: new NoopFocusContext(),
      directive: undefined,
      event: Button.Down,
      next: element,
      target: document.body,
    });

    record.onIncoming!(event);

    expect(event.next!.className).to.equal('c');
  });

  it('does not intercept focus events inside the element', () => {
    const { record, element } = render();

    const event = new ArcFocusEvent({
      context: new NoopFocusContext(),
      directive: undefined,
      event: Button.Down,
      next: element.querySelector('.c'),
      target: element.querySelector('.b') as HTMLElement,
    });

    record.onIncoming!(event);

    expect(event.next!.className).to.equal('c');
  });
});
