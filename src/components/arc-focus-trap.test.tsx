import { expect } from 'chai';
import * as React from 'react';

import { ArcFocusEvent } from '../arc-focus-event';
import { ArcContext } from '../internal-types';
import { Button } from '../model';
import { StateContainer } from '../state/state-container';
import { FocusTrap, IFocusTrapProps } from './arc-focus-trap';
import { mountToDOM, NoopFocusContext } from './util.test';

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
    const contents = mountToDOM(
      <TestComponent
        state={state}
        {...props}
        showTrapDefault={showTrapDefault}
      />
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
    const { record } = render();
    const event = new ArcFocusEvent({
      context: new NoopFocusContext(),
      directive: undefined,
      event: Button.Down,
      next: document.body,
      target: document.body,
    });

    record.onOutgoing!(event);
    expect(event.defaultPrevented).to.equal(true);
  });

  it('allows focusing within the trap', () => {
    const { record, element } = render();
    const event = new ArcFocusEvent({
      context: new NoopFocusContext(),
      directive: undefined,
      event: Button.Down,
      next: element.querySelector('.c') as HTMLElement,
      target: document.body,
    });

    record.onOutgoing!(event);
    expect(event.defaultPrevented).to.equal(false);
  });

  it('focuses the first element by default', async () => {
    render();
    await delay();
    expect(document.activeElement.className).to.equal('b');
  });

  it('passes focus to an overridden selector', async () => {
    render({ focusIn: '.c' });
    await delay();
    expect(document.activeElement.className).to.equal('c');
  });

  it('passes focus to the previously focused element when destroying', async () => {
    const { contents } = render({}, false);
    (contents.getDOMNode().querySelector('.a') as HTMLElement).focus();
    contents.find('.a').simulate('click');
    await delay();
    expect(document.activeElement.className).to.equal('b');
    contents.find('.b').simulate('click');
    expect(document.activeElement.className).to.equal('a');
  });

  it('allows a custom focus out element', async () => {
    const { contents } = render({ focusOut: document.body }, false);
    contents.find('.a').simulate('click');
    await delay();
    expect(document.activeElement.className).to.equal('b');
    contents.find('.b').simulate('click');
    expect(document.activeElement).to.equal(document.body);
  });

  it('respects any immediate autofocused elements', async () => {
    const { contents } = render({ focusOut: document.body }, false);
    contents.find('.a').simulate('click');
    (contents.getDOMNode().querySelector('.c') as HTMLElement).focus();
    await delay();
    expect(document.activeElement.className).to.equal('c');
  });
});
