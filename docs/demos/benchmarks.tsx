import * as React from 'react';
import { selectSimpleElementBenchmark } from './benchmarks/select-simple-element';
import { selectDeeplyNestedBenchmark } from './benchmarks/select-deeply-nested';
import { selectArcadeMachineBenchmark } from './benchmarks/select-arcade-machine';
import { selectArcadeMachineVirtualBenchmark } from './benchmarks/select-arcade-machine-virtual';
import { selectArcadeMachineRaycastBenchmark } from './benchmarks/select-raycast';

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

const benchmarks: IBenchmark<any, any>[] = [
  selectSimpleElementBenchmark,
  selectArcadeMachineBenchmark,
  selectArcadeMachineVirtualBenchmark,
  selectDeeplyNestedBenchmark,
  selectArcadeMachineRaycastBenchmark,
];

function average(data: number[]) {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

/**
 * BenchmarkRow is rendered for each element in the list of benchmarks.
 */
export class BenchmarkRow extends React.Component<
  { case: IBenchmark<any> },
  { result: string; running: boolean }
> {
  private readonly fixtureRef = React.createRef<HTMLTableDataCellElement>();

  public state = { result: '', running: false };

  private runSelf = () => {
    this.setState({ result: 'running', running: true });
    setTimeout(this.doBenchmark, 500);
  };

  private doBenchmark = () => {
    const { setup, iterate } = this.props.case;
    const state = { container: this.fixtureRef.current! };
    const setupResult = setup ? setup(state) : null;
    const measurements: number[] = [];
    let neededIterations = 200;
    let previous: any;

    const run = () => {
      const start = performance.now();
      previous = iterate(state, setupResult, previous);
      measurements.push(performance.now() - start);
      if (measurements.length < neededIterations) {
        requestAnimationFrame(run);
        return;
      }

      const avg = average(measurements);
      const stdev = Math.sqrt(average(measurements.map(m => (m - avg) ** 2)));
      const opsPerSecond = Math.round(1000 / avg);
      this.setState({
        result: `${avg.toFixed(2)} ms/op ± ${stdev.toFixed(2)} (${opsPerSecond} op/sec)`,
        running: false,
      });
    };

    requestAnimationFrame(run);
  };

  public render() {
    return (
      <tr>
        <td>{this.props.case.name}</td>
        <td ref={this.fixtureRef}>{this.state.running ? <this.props.case.fixture /> : null}</td>
        <td>
          {this.state.result}
          <br />
          <button onClick={this.runSelf} disabled={this.state.running}>
            Run This
          </button>
        </td>
      </tr>
    );
  }
}

export default () => (
  <table>
    <thead>
      <tr>
        <th>Benchmark</th>
        <th>DOM Fixture</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      {benchmarks.map((benchmark, i) => (
        <BenchmarkRow case={benchmark} key={i} />
      ))}
    </tbody>
  </table>
);
