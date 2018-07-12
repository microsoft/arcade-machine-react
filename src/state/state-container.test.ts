import { expect } from 'chai';

import { ArcEvent } from '../arc-event';
import { Button } from '../model';
import { StateContainer } from './state-container';

describe('StateContainer', () => {
  it('adds, removes, and finds elements', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.find(element)).to.be.undefined;

    store.add(0, { element, excludeThis: true });
    const result = store.find(element);
    expect(result).not.to.be.undefined;
    expect(result!.excludeThis).to.equal(true);

    store.remove(0, element);
    expect(store.find(element)).to.be.undefined;
  });

  it('refcounts deep checks', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.hasExcludedDeepElements()).to.equal(false);

    store.add(0, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).to.equal(true);

    store.remove(0, element);
    expect(store.hasExcludedDeepElements()).to.equal(false);
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

  it('refcounts deep checks when merging in state', () => {
    const store = new StateContainer();
    const element = document.createElement('div');

    store.add(1, { element, exclude: false });
    expect(store.hasExcludedDeepElements()).to.equal(false);

    store.add(2, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).to.equal(true);

    store.add(3, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).to.equal(true);

    store.remove(2, element);
    expect(store.hasExcludedDeepElements()).to.equal(true);
    store.remove(3, element);
    expect(store.hasExcludedDeepElements()).to.equal(false);
    store.remove(1, element);
    expect(store.hasExcludedDeepElements()).to.equal(false);
  });

  it('combines function calls', () => {
    const calls: number[] = [];
    const store = new StateContainer();
    const element = document.createElement('div');

    store.add(0, { element, onOutgoing: () => calls.push(0) });
    store.add(1, { element, onOutgoing: () => calls.push(1) });
    store.add(2, { element, onOutgoing: ev => ev.stopPropagation() });
    store.add(3, { element, onOutgoing: () => calls.push(3) });
    store.find(element)!.onOutgoing!(
      new ArcEvent({ next: null, event: Button.Submit, target: null }),
    );

    expect(calls).to.deep.equal([0, 1]);
  });
});
