import * as React from 'react';

export class FocusHistoryDemo extends React.Component<{}, { ticker: number }> {
  private readonly boxes: string[] = [];

  constructor(props: {}) {
    super(props);

    this.state = {
      ticker: 0,
    };

    for (let i = 0; i < 50; i++) {
      this.boxes.push(String(`Box ${i}`));
    }

    let k = 0;
    setInterval(() => this.setState({ ...this.state, ticker: ++k }), 2500);
  }

  public render() {
    return (
      <React.Fragment>
        <h1>History</h1>
        <h2>Prefer last focused element</h2>
        <div className="area" style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="box"
            tabIndex={0}
            style={{ display: 'inline-block', marginLeft: 50, width: 150, height: 150 }}
          />
          <div id="focus-inside1" style={{ display: 'inline-block', margin: 50 }}>
            <div className="box" tabIndex={0} style={{ width: 50, height: 50 }} />
            <div className="box" tabIndex={0} style={{ width: 50, height: 50 }} />
            <div className="box" tabIndex={0} style={{ width: 50, height: 50 }} />
          </div>
        </div>
        <h1>Adding/Removing Elements</h1>
        <div className="area">
          {this.boxes.map((box, i) => (
            <div className="box-wrapper" key={i}>
              {(i + this.state.ticker) % 2 === 0 ? (
                <div className="box" tabIndex={0}>
                  {box}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}
