import * as React from 'react';
import { Suite, Event } from 'benchmark';
import { IBenchmark, benchmarks } from './benchmarks';

declare const Benchmark: any;

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
    const suite = new Benchmark.Suite();
    this.addTestCase(suite);
    suite.run({ async: true });
  };

  public addTestCase(suite: Suite) {
    const { name, setup, iterate } = this.props.case;
    const state = { container: this.fixtureRef.current! };

    this.setState({ result: 'queued...' });

    let setupResult: any;
    let didRun = false;
    let previous: any;
    suite.add(
      name,
      () => {
        if (!didRun) {
          this.setState({ result: 'running', running: true });
          setupResult = setup ? setup(state) : null;
          didRun = true;
        }

        previous = iterate(state, setupResult, previous);
      },
      {
        onComplete: (ev: Event) => {
          const target: any = ev.target;
          if (target.error) {
            this.setState({ result: target.error.toString(), running: false });
            return;
          }

          this.setState({
            running: false,
            result: `${Math.round(target.hz)} ops/sec ± ${target.stats.rme.toFixed(2)} (${(
              target.stats.mean * 1000
            ).toFixed(3)}ms each)`,
          });
        },
      },
    );
  }

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

/**
 * Benchmarks is the table of runnable benchmarks.
 */
export class Benchmarks extends React.Component<{}, { running: boolean }> {
  public state = { running: false };

  private readonly benchmarkRows: React.RefObject<BenchmarkRow>[] = benchmarks.map(() =>
    React.createRef(),
  );

  private runAll = () => {
    const suite = new Benchmark.Suite();

    this.benchmarkRows.forEach(row => {
      row.current!.addTestCase(suite);
    });

    suite.on('complete', () => {
      this.setState({ running: false });
    });

    suite.run({ async: true });
  };

  public render() {
    return (
      <React.Fragment>
        <h1>Benchmarks</h1>
        <div className="area">
          <table className="benchmarks">
            <thead>
              <tr>
                <th>Benchmark</th>
                <th>DOM Fixture</th>
                <th>
                  Result{' '}
                  <button onClick={this.runAll} disabled={this.state.running}>
                    Run All
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((benchmark, i) => (
                <BenchmarkRow case={benchmark} ref={this.benchmarkRows[i]} key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}
