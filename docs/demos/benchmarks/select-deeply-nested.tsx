import * as React from 'react';
import { ArcRoot, Button, defaultOptions, VirtualElementStore } from '../../../src';
import { IBenchmark } from '../benchmarks';
import { Subject } from 'rxjs';
import { basicGrid } from '../demo-utils';

const mockInputMethod = {
  observe: new Subject<{ button: Button }>(),
  isSupported: true,
};

const elementStore = new VirtualElementStore();

interface INestedProps {
  levels: number;
  children: React.ReactElement<any>;
}

const NestedElement: React.ComponentType<INestedProps> = ({ levels, children }: INestedProps) => (
  <div>{levels ? <NestedElement levels={levels - 1} children={children} /> : children}</div>
);

export const selectDeeplyNestedBenchmark: IBenchmark<void, boolean> = {
  name: 'Virtual store w/ highly nested elements (100 levels from the root)',
  fixture: ArcRoot(
    () => (
      <React.Fragment>
        <NestedElement levels={100}>{basicGrid(1, 1)}</NestedElement>
        <NestedElement levels={100}>{basicGrid(1, 1)}</NestedElement>
      </React.Fragment>
    ),
    {
      ...defaultOptions(),
      inputs: [mockInputMethod],
      elementStore,
    },
  ),
  setup: state => {
    elementStore.element = state.container.querySelector('[data-box="0 0"]') as HTMLElement;
  },
  iterate: (_state, _setup, toggle) => {
    mockInputMethod.observe.next({ button: toggle ? Button.Up : Button.Down });
    return !toggle;
  },
};
