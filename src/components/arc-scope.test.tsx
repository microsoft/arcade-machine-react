import { expect } from 'chai';
import * as React from 'react';

import { ArcContext } from '../internal-types';
import { StateContainer } from '../state/state-container';
import { ArcDown, ArcUp } from './arc-scope';
import { mountToDOM } from './util.test';

describe('ArcScope', () => {
  const render = (Component: React.ComponentType<{}>) => {
    const state = new StateContainer();
    const contents = mountToDOM(
      <div>
        <ArcContext.Provider value={{ state }}>
          <Component />
        </ArcContext.Provider>,
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
    expect(record).to.deep.equal({
      arcFocusDown: '#foo',
      element: targetEl,
    });
  });

  it('removes state when unmounting the component', () => {
    const { state, contents } = render(ArcDown('#foo', () => <div className="testclass" />));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    contents.unmount();
    expect(state.find(targetEl)).to.be.undefined;
  });

  it('composes multiple arc scopes into a single context', () => {
    const { state, contents } = render(ArcDown('#foo', ArcUp('#bar', () => <div className="testclass" />)));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    expect(state.find(targetEl)).to.deep.equal({
      arcFocusDown: '#foo',
      arcFocusUp: '#bar',
      element: targetEl,
    });

    expect((state as any).arcs.get(targetEl).records).to.have.lengthOf(1);
  });
});
