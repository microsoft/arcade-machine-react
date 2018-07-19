import * as React from 'react';
import { ArcRoot, Button, defaultOptions, VirtualElementStore } from '../../../src';
import { IBenchmark } from './index';
import { Subject } from 'rxjs';

const mockInputMethod = {
  observe: new Subject<{ button: Button }>(),
  isSupported: true,
};

const elementStore = new VirtualElementStore();

export const virtualArcadeSelectBenchmark: IBenchmark<void, boolean> = {
  name: 'arcade-machine focus with a virtual element store',
  fixture: ArcRoot(
    () => (
      <React.Fragment>
        <div className="square box box1" tabIndex={0} />
        <div className="square box box2" tabIndex={0} />
      </React.Fragment>
    ),
    {
      ...defaultOptions(),
      inputs: [mockInputMethod],
      elementStore,
    },
  ),
  setup: state => {
    elementStore.element = state.container.querySelector('.box1') as HTMLElement;
  },
  iterate: (_state, _setup, toggle) => {
    mockInputMethod.observe.next({ button: toggle ? Button.Right : Button.Left });
    return !toggle;
  },
};
