import { mount } from 'enzyme';
import * as React from 'react';

import { ArcContext } from '../internal-types';
import { StateContainer } from '../state/state-container';
import { ArcDown, ArcUp } from './arc-scope';

describe('ArcScope', () => {
  const render = (Component: React.ComponentType<{}>) => {
    const state = new StateContainer();
    const contents = mount(
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
    expect(targetEl).toBeTruthy();
    const record = state.find(targetEl);
    expect(record).toBeTruthy();
    expect(record).toEqual({
      arcFocusDown: '#foo',
      element: targetEl,
    });
    contents.unmount();
  });

  it('removes state when unmounting the component', () => {
    const { state, contents } = render(ArcDown('#foo', () => <div className="testclass" />));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    contents.unmount();
    expect(state.find(targetEl)).toBeUndefined();
  });

  it('composes multiple arc scopes into a single context', () => {
    const { state, contents } = render(ArcDown('#foo', ArcUp('#bar', () => <div className="testclass" />)));
    const targetEl = contents.getDOMNode().querySelector('.testclass') as HTMLElement;
    expect(state.find(targetEl)).toEqual({
      arcFocusDown: '#foo',
      arcFocusUp: '#bar',
      element: targetEl,
    });

    expect((state as any).arcs.get(targetEl).records).toHaveLength(1);
    contents.unmount();
  });
});
