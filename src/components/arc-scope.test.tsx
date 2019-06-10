import { expect } from 'chai';
import * as React from 'react';

import { NativeElementStore } from '../focus/native-element-store';
import { instance } from '../singleton';
import { StateContainer } from '../state/state-container';
import { ArcDown, ArcUp } from './arc-scope';
import { mountToDOM, unmountAll } from './util.test';

describe('ArcScope', () => {
  const render = (Component: React.ComponentType<{}>) => {
    const state = new StateContainer();
    instance.setServices({
      elementStore: new NativeElementStore(),
      stateContainer: state,
    });

    const contents = mountToDOM(
      <div>
        <Component />
      </div>,
    );

    return {
      contents,
      state,
    };
  };

  it('renders and stores data in the state', () => {
    const { state, contents } = render(ArcDown('#foo', () => <div className="testclass" />));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    expect(targetEl).to.not.be.undefined;
    const record = state.find(targetEl);
    expect(record).to.not.be.undefined;
    expect(record!.arcFocusDown).to.equal('#foo');
    expect(record!.element).to.equal(targetEl);
  });

  it('removes state when unmounting the component', () => {
    const { state, contents } = render(ArcDown('#foo', () => <div className="testclass" />));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    unmountAll();
    expect(state.find(targetEl)).to.be.undefined;
  });

  it('composes multiple arc scopes into a single context', () => {
    const { state, contents } = render(
      ArcDown('#foo', ArcUp('#bar', () => <div className="testclass" />)),
    );
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    const record = state.find(targetEl);
    expect(record).to.not.be.undefined;
    expect(record!.arcFocusDown).to.equal('#foo');
    expect(record!.arcFocusUp).to.equal('#bar');
    expect(record!.element).to.equal(targetEl);

    expect((state as any).arcs.get(targetEl).records).to.have.lengthOf(1);
  });
});
