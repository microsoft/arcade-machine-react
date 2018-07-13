import { expect } from 'chai';

import { ArcEvent } from '../arc-event';
import { Button } from '../model';
import { StateContainer } from './state-container';

describe('StateContainer', () => {
  it('adds, removes, and finds elements', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.find(element)).to.be.undefined;

    store.add(0, { element, arcFocusDown: '.foo' });
    const result = store.find(element);
    expect(result).not.to.be.undefined;
    expect(result!.arcFocusDown).to.equal('.foo');

    store.remove(0, element);
    expect(store.find(element)).to.be.undefined;
  });

  it('merges in state', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.find(element)).to.be.undefined;

    store.add(1, { element, arcFocusUp: '.up' });
    expect(store.find(element)).to.deep.equal({ element, arcFocusUp: '.up' });

    store.add(2, { element, arcFocusDown: '.down' });
    expect(store.find(element)).to.deep.equal({
      arcFocusDown: '.down',
      arcFocusUp: '.up',
      element,
    });

    store.remove(1, element);
    expect(store.find(element)).to.deep.equal({ element, arcFocusDown: '.down' });

    store.remove(2, element);
    expect(store.find(element)).to.be.undefined;
  });

  it('combines function calls', () => {
    const calls: number[] = [];
    const store = new StateContainer();
    const element = document.createElement('div');

    store.add(0, { element, onButton: () => calls.push(0) });
    store.add(1, { element, onButton: () => calls.push(1) });
    store.add(2, { element, onButton: ev => ev.stopPropagation() });
    store.add(3, { element, onButton: () => calls.push(3) });
    store.find(element)!.onButton!(new ArcEvent({ event: Button.Submit, target: document.body }));

    expect(calls).to.deep.equal([0, 1]);
  });
});
