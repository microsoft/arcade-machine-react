import { ArcRoot, Button, defaultOptions, VirtualElementStore } from '../../../src';
import { IBenchmark } from '../benchmarks';
import { Subject } from 'rxjs';
import { basicGrid } from '../demo-utils';

const mockInputMethod = {
  observe: new Subject<{ button: Button }>(),
  isSupported: true,
};

export const selectArcadeMachineVirtualBenchmark: IBenchmark<void, boolean> = {
  name: 'Select simple with arcade machine (virtual store)',
  fixture: ArcRoot(() => basicGrid(2, 1), {
    ...defaultOptions(),
    elementStore: new VirtualElementStore(),
    inputs: [mockInputMethod],
  }),
  setup: state => {
    (state.container.querySelector('[data-box="0 0"]') as HTMLElement).focus();
  },
  iterate: (_state, _setup, toggle) => {
    mockInputMethod.observe.next({ button: toggle ? Button.Right : Button.Left });
    return !toggle;
  },
};
