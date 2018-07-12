import { ArcEvent } from '../arc-event';
import { Button } from '../model';
import { StateContainer } from './state-container';

describe('StateContainer', () => {
  it('adds, removes, and finds elements', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.find(element)).toBeUndefined();

    store.add(0, { element, excludeThis: true });
    const result = store.find(element);
    expect(result).toBeDefined();
    expect(result!.excludeThis).toBe(true);

    store.remove(0, element);
    expect(store.find(element)).toBeUndefined();
  });

  it('refcounts deep checks', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.hasExcludedDeepElements()).toBe(false);

    store.add(0, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).toBe(true);

    store.remove(0, element);
    expect(store.hasExcludedDeepElements()).toBe(false);
  });

  it('merges in state', () => {
    const store = new StateContainer();
    const element = document.createElement('div');
    expect(store.find(element)).toBeUndefined();

    store.add(1, { element, arcFocusUp: '.up' });
    expect(store.find(element)).toEqual({ element, arcFocusUp: '.up' });

    store.add(2, { element, arcFocusDown: '.down' });
    expect(store.find(element)).toEqual({ element, arcFocusUp: '.up', arcFocusDown: '.down' });

    store.remove(1, element);
    expect(store.find(element)).toEqual({ element, arcFocusDown: '.down' });

    store.remove(2, element);
    expect(store.find(element)).toBeUndefined();
  });

  it('refcounts deep checks when merging in state', () => {
    const store = new StateContainer();
    const element = document.createElement('div');

    store.add(1, { element, exclude: false });
    expect(store.hasExcludedDeepElements()).toBe(false);

    store.add(2, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).toBe(true);

    store.add(3, { element, exclude: true });
    expect(store.hasExcludedDeepElements()).toBe(true);

    store.remove(2, element);
    expect(store.hasExcludedDeepElements()).toBe(true);
    store.remove(3, element);
    expect(store.hasExcludedDeepElements()).toBe(false);
    store.remove(1, element);
    expect(store.hasExcludedDeepElements()).toBe(false);
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

    expect(calls).toEqual([0, 1]);
  });
});
