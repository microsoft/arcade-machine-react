import { mount } from 'enzyme';
import * as React from 'react';

import { ArcEvent } from '../arc-event';
import { ArcContext } from '../internal-types';
import { Direction } from '../model';
import { StateContainer } from '../state/state-container';
import { FocusArea } from './arc-focus-area';

describe('ArcFocusArea', () => {
  const render = (focusIn?: string) => {
    const state = new StateContainer();
    const contents = mount(
      <div>
        <ArcContext.Provider value={{ state }}>
          <FocusArea focusIn={focusIn}>
            <div className="a" />
            <div className="b" tabIndex={0} />
            <div className="c" tabIndex={0}/>
          </FocusArea>
        </ArcContext.Provider>,
      </div>,
    );

    const element = contents.getDOMNode().querySelector('div') as HTMLElement;
    const record = state.find(element)!;
    expect(record).toBeTruthy();

    return {
      contents,
      element,
      record,
      state,
    };
  };

  it('focuses the first focusable element by default', () => {
    const { contents, record, element } = render();

    const event = new ArcEvent({
      directive: undefined,
      event: Direction.Down,
      next: element,
      target: null,
    });

    record.onIncoming!(event);

    expect(event.next!.className).toBe('b');
    contents.unmount();
  });

  it('overrides focusable by a query', () => {
    const { contents, record, element } = render('.c');

    const event = new ArcEvent({
      directive: undefined,
      event: Direction.Down,
      next: element,
      target: null,
    });

    record.onIncoming!(event);

    expect(event.next!.className).toBe('c');
    contents.unmount();
  });

  it('does not intercept focus events inside the element', () => {
    const { contents, record, element } = render();

    const event = new ArcEvent({
      directive: undefined,
      event: Direction.Down,
      next: element.querySelector('.c'),
      target: element.querySelector('.b'),
    });

    record.onIncoming!(event);

    expect(event.next!.className).toBe('c');
    contents.unmount();
  });
});