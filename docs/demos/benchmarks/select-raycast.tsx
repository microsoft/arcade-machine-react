import { ArcRoot, Button, defaultOptions, FocusByRaycastStrategy } from '../../../src';
import { IBenchmark } from '../benchmarks';
import { Subject } from 'rxjs';
import { basicGrid } from '../demo-utils';

const mockInputMethod = {
  observe: new Subject<{ button: Button }>(),
  isSupported: true,
};

export const selectArcadeMachineRaycastBenchmark: IBenchmark<void, boolean> = {
  name: 'Select via raycast focus strategy (native store)',
  fixture: ArcRoot(() => basicGrid(2, 1), {
    ...defaultOptions(),
    focus: [new FocusByRaycastStrategy()],
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
