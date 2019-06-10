import { IBenchmark } from '../benchmarks';
import { basicGrid } from '../demo-utils';

export const selectSimpleElementBenchmark: IBenchmark<[HTMLElement, HTMLElement], boolean> = {
  name: 'Select simple element (base case, no arcade-machine)',
  fixture: () => basicGrid(2, 1),
  setup: state => {
    return [
      state.container.querySelector('[data-box="0 0"]') as HTMLElement,
      state.container.querySelector('[data-box="1 0"]') as HTMLElement,
    ];
  },
  iterate: (_state, [a, b], toggle) => {
    if (toggle) {
      a.focus();
    } else {
      b.focus();
    }

    return !toggle;
  },
};
