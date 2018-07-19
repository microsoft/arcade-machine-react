import * as React from 'react';
import { render } from 'react-dom';
import { ArcRoot, defaultOptions, VirtualElementStore } from '../src';
import { FocusHooksDemo } from './components/FocusHooksDemo';
import { FocusInsideDemo } from './components/FocusInsideDemo';
import { FocusTrapsDemo } from './components/FocusTrapsDemo';
import { FocusHistoryDemo } from './components/FocusHistoryDemo';
import { FocusGridDemo } from './components/FocusGridDemo';
import { FocusHiddenDemo } from './components/FocusHiddenDemo';
import { Benchmarks } from './components/FocusBenchmarks';
import { FocusFormDemo } from './components/FocusFormDemo';

const DemoApp = ArcRoot(
  () => (
    <div>
      <FocusHooksDemo />
      <FocusInsideDemo />
      <FocusTrapsDemo />
      <FocusFormDemo />
      <FocusHistoryDemo />
      <FocusGridDemo />
      <FocusHiddenDemo />
    </div>
  ),
  { ...defaultOptions(), elementStore: new VirtualElementStore() },
);

const BenchmarkApp = () => <Benchmarks />;

render(
  window.location.toString().includes('benchmarks') ? <BenchmarkApp /> : <DemoApp />,
  document.getElementById('app'),
);
