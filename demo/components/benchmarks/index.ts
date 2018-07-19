import { selectSimpleElementBenchmark } from './select-simple-element';
import { selectArcadeMachineBenchmark } from './select-arcade-machine';
import { virtualArcadeSelectBenchmark } from './virtual-arcade-select';
import { selectDeeplyNestedBenchmark } from './select-deeply-nested';

/**
 * IBenchmarkState is passed to the setup of each benchmark script.
 */
export interface IBenchmarkState {
  container: HTMLElement;
}

/**
 * IBenchmark describes a benchmark to run on the arcade machine.
 */
export interface IBenchmark<T, R = void> {
  name: string;
  fixture: React.ComponentType<any>;
  setup?: (container: IBenchmarkState) => T;
  iterate: (container: IBenchmarkState, setup: T, prev: R | undefined) => R;
}

export const benchmarks: IBenchmark<any, any>[] = [
  selectSimpleElementBenchmark,
  selectArcadeMachineBenchmark,
  virtualArcadeSelectBenchmark,
  selectDeeplyNestedBenchmark,
];
