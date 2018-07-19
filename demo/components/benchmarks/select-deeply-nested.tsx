import * as React from 'react';
import { ArcRoot, Button, defaultOptions, VirtualElementStore } from '../../../src';
import { IBenchmark } from './index';
import { Subject } from 'rxjs';

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

export const selectDeeplyNested: IBenchmark<void, boolean> = {
  name: 'virtual store w/ highly nested elements (100 levels from the root)',
  fixture: ArcRoot(
    () => (
      <React.Fragment>
        <NestedElement levels={100}>
          <div className="square box box1" tabIndex={0} />
        </NestedElement>
        <NestedElement levels={100}>
          <div className="square box box2" tabIndex={0} />
        </NestedElement>
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
    mockInputMethod.observe.next({ button: toggle ? Button.Up : Button.Down });
    return !toggle;
  },
};
