import { mount } from 'enzyme';
import * as React from 'react';

import { ArcEvent } from '../arc-event';
import { ArcContext } from '../internal-types';
import { Direction } from '../model';
import { StateContainer } from '../state/state-container';
import { FocusTrap, IFocusTrapProps } from './arc-focus-trap';

const delay = () => new Promise(resolve => setTimeout(resolve));

describe('ArcFocusTrap', () => {
  class TestComponent extends React.Component<{
    state: StateContainer;
    showTrapDefault?: boolean;
  } & Partial<IFocusTrapProps>> {
    public state = { showTrap: this.props.showTrapDefault };

    public render() {
      return (
        <div>
          <ArcContext.Provider value={{ state: this.props.state }}>
            <div className="a" tabIndex={0} onClick={this.showTrap} />
            {this.state.showTrap ? (
              <FocusTrap focusIn={this.props.focusIn} focusOut={this.props.focusOut}>
                <div className="b" tabIndex={0} onClick={this.hideTrap} />
                <div className="c" tabIndex={0} />
              </FocusTrap>
            ) : null}
          </ArcContext.Provider>
        </div>
      );
    }

    private hideTrap = () => this.setState({ showTrap: false });
    private showTrap = () => this.setState({ showTrap: true });
  }

  const render = (props?: Partial<IFocusTrapProps>, showTrapDefault: boolean = true) => {
    const state = new StateContainer();
    const contents = mount(
      <TestComponent
        state={state}
        {...props}
        showTrapDefault={showTrapDefault}
      />,
    );
    const element = contents.getDOMNode().querySelector('.arc-focus-trap') as HTMLElement;
    const record = state.find(element)!;

    return {
      contents,
      element,
      record,
      state,
    };
  };

  it('prevents navigating outside of the focus trap', () => {
    const { contents, record } = render();
    const event = new ArcEvent({
      directive: undefined,
      event: Direction.Down,
      next: document.body,
      target: null,
    });

    record.onOutgoing!(event);
    expect(event.defaultPrevented).toBe(true);
    contents.unmount();
  });

  it('allows focusing within the trap', () => {
    const { contents, record, element } = render();
    const event = new ArcEvent({
      directive: undefined,
      event: Direction.Down,
      next: element.querySelector('.c'),
      target: null,
    });

    record.onOutgoing!(event);
    expect(event.defaultPrevented).toBe(false);
    contents.unmount();
  });

  it('focuses the first element by default', async () => {
    const { contents } = render();
    await delay();
    expect(document.activeElement.className).toBe('b');
    contents.unmount();
  });

  it('passes focus to an overridden selector', async () => {
    const { contents } = render({ focusIn: '.c' });
    await delay();
    expect(document.activeElement.className).toBe('c');
    contents.unmount();
  });

  it('passes focus to the previously focused element when destroying', async () => {
    const { contents } = render({}, false);
    (contents.getDOMNode().querySelector('.a') as HTMLElement).focus();
    contents.find('.a').simulate('click');
    await delay();
    expect(document.activeElement.className).toBe('b');
    contents.find('.b').simulate('click');
    expect(document.activeElement.className).toBe('a');
    contents.unmount();
  });

  it('allows a custom focus out element', async () => {
    const { contents } = render({ focusOut: document.body }, false);
    contents.find('.a').simulate('click');
    await delay();
    expect(document.activeElement.className).toBe('b');
    contents.find('.b').simulate('click');
    expect(document.activeElement).toBe(document.body);
    contents.unmount();
  });

  it('respects any immediate autofocused elements', async () => {
    const { contents } = render({ focusOut: document.body }, false);
    contents.find('.a').simulate('click');
    (contents.getDOMNode().querySelector('.c') as HTMLElement).focus();
    await delay();
    expect(document.activeElement.className).toBe('c');
    contents.unmount();
  });
});
