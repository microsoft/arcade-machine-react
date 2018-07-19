import * as React from 'react';
import { IBenchmark } from './index';

export const selectSimpleElementBenchmark: IBenchmark<[HTMLElement, HTMLElement], boolean> = {
  name: 'Select simple element (base case, no arcade-machine)',
  fixture: () => (
    <React.Fragment>
      <div className="square box box1" tabIndex={0} />
      <div className="square box box2" tabIndex={0} />
    </React.Fragment>
  ),
  setup: state => {
    return [
      state.container.querySelector('.box1') as HTMLElement,
      state.container.querySelector('.box2') as HTMLElement,
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
