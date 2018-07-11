import * as React from 'react';
import { render } from 'react-dom';
import { ArcRoot, ArcAutoFocus, ArcUp, ArcDown } from '../src';

const AutofocusBox = ArcAutoFocus(
  class extends React.PureComponent<{ onClick: () => void }> {
    public render() {
      return (
        <div className="box" tabIndex={0} onClick={this.props.onClick}>
          I capture default focus! Click me to toggle!
        </div>
      );
    }
  },
);

const UpDownOverrideBox = ({ index }: { index: number }) => (
  <div id={`override${index}`} className="box" tabIndex={0}>
    up/down override
  </div>
);

const UpDownOverride1 = ArcUp('#override3', ArcDown('#override2', UpDownOverrideBox));
const UpDownOverride2 = ArcUp('#override1', ArcDown('#override3', UpDownOverrideBox));
const UpDownOverride3 = ArcUp('#override2', ArcDown('#override1', UpDownOverrideBox));

const MyApp = ArcRoot(
  class extends React.Component<
    {},
    {
      showAFBox: boolean;
      isDialogVisible: boolean;
      ticker: number;
    }
  > {
    private readonly boxes: string[] = [];

    private readonly toggleAFBox = () => {
      this.setState({ ticker: 0, showAFBox: false });
      setTimeout(() => this.setState({ ...this.state, showAFBox: true }), 1000);
    };

    constructor(props: {}) {
      super(props);

      this.state = {
        showAFBox: true,
        isDialogVisible: false,
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
        <div>
          <h1>Special Handlers</h1>
          <div className="area">
            <div className="box-wrapper" style={{ width: '200px' }}>
              {this.state.showAFBox ? <AutofocusBox onClick={this.toggleAFBox} /> : null}
            </div>
            <div className="box-wrapper">
              <UpDownOverride1 index={1} />
            </div>
            <div className="box-wrapper">
              <UpDownOverride2 index={2} />
            </div>
            <div className="box-wrapper">
              <UpDownOverride3 index={3} />
            </div>
          </div>
          <h1>Focus Inside</h1>
          Transfer focus to elements inside me
          <div
            className="area"
            tabIndex={0}
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              With arc-focus-inside
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
              <div id="focus-inside1" className="area" tabIndex={0}>
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} style={{ marginLeft: '100px' }} />
              </div>
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              With arc-focus-inside
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
              <div
                id="focus-inside1"
                className="area"
                style={{ minHeight: '85px', width: '100%' }}
                tabIndex={0}
              >
                Empty element with arc-focus-inside
                <div
                  className="area"
                  style={{ minHeight: '45px', width: '80%', margin: '15px' }}
                  tabIndex={0}
                >
                  Empty element with arc-focus-inside
                </div>
              </div>
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              Without arc-focus-inside
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div
                  className="square"
                  tabIndex={0}
                  style={{
                    display: 'inline-block',
                    width: '50px',
                    height: '50px',
                    marginLeft: '100px',
                  }}
                />
              </div>
              <div id="focus-inside1" className="area">
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
                <div className="square" tabIndex={0} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  },
);

render(<MyApp />, document.getElementById('app'));
