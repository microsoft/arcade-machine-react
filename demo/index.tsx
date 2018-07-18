import { FocusExclude } from '../src/components/arc-exclude';
import * as React from 'react';
import { render } from 'react-dom';
import {
  ArcAutoFocus,
  ArcDown,
  ArcFocusTrap,
  ArcOnIncoming,
  ArcRoot,
  ArcUp,
  FocusArea,
  FocusTrap,
} from '../src';

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

const ArcShouldNotFocus = ArcOnIncoming(
  ev => alert(`Unexpected incoming focus in: ${ev.next.parentElement.innerHTML}`),
  (props: { style?: any }) => <div className="square" tabIndex={0} {...props} />,
);

const Dialog = ArcFocusTrap(
  class extends React.Component<{ onClose: () => void }, { showTrap: boolean }> {
    private showTrap = () => this.setState({ showTrap: true });
    private hideTrap = () => this.setState({ showTrap: false });

    constructor(props: { onClose: () => void }) {
      super(props);
      this.state = { showTrap: false };
    }

    public render() {
      return (
        <div className="area dialog">
          <div>
            <button tabIndex={0}>Button 1</button>
            <button tabIndex={0}>Button 2</button>
          </div>
          <div>
            <button tabIndex={0} onClick={this.showTrap}>
              Show nested focus trap
            </button>
          </div>
          {this.state.showTrap ? (
            <FocusTrap>
              <div style={{ border: '1px solid red' }}>
                <button tabIndex={0}>Button 1</button>
                <button tabIndex={0}>Button 2</button>
                <button onClick={this.hideTrap} tabIndex={0}>
                  Hide nested trap
                </button>
              </div>
            </FocusTrap>
          ) : null}
          <div>
            <button onClick={this.props.onClose} tabIndex={0}>
              Close
            </button>
          </div>
        </div>
      );
    }
  },
);

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

    private readonly onDialogOpen = () => {
      this.setState({ isDialogVisible: true });
    };

    private readonly onDialogClose = () => {
      this.setState({ isDialogVisible: false });
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
          <div className="area" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              With arc-focus-inside
              <FocusArea>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                </div>
              </FocusArea>
              <FocusArea>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} style={{ marginLeft: '100px' }} />
                </div>
              </FocusArea>
              <FocusArea>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                </div>
              </FocusArea>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              With focus excluded
              <FocusExclude>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                </div>
              </FocusExclude>
              <FocusExclude>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} style={{ marginLeft: '100px' }} />
                </div>
              </FocusExclude>
              <FocusExclude>
                <div id="focus-inside1" className="area">
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                  <div className="square" tabIndex={0} />
                </div>
              </FocusExclude>
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
          <h1>Focus Child Elements Only</h1>
          <button tabIndex={0} onClick={this.onDialogOpen}>
            Open Dialog
          </button>
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
          <h1>A Form</h1>
          <div className="area">
            <form>
              <div>
                <input tabIndex={0} placeholder="Username" />
              </div>
              <div>
                <input tabIndex={0} placeholder="Password" type="password" />
              </div>
              <div>
                <textarea tabIndex={0} />
              </div>
              <div>
                <button tabIndex={0}>Submit</button>
              </div>
            </form>
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
          <h1>A Grid</h1>
          <div className="area">
            <div>
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
              <div className="square" tabIndex={0} />
            </div>
            <div>
              <div className="square" tabIndex={0} />
            </div>
          </div>
          <h1>Hidden Boxes</h1>
          To the right of each description is an invisible box. These should not be focusable, and
          will alert if you try to focus them.
          <div className="area">
            <div className="visibility-test">
              <div className="case-name" tabIndex={0}>
                base case (should focus)
              </div>
              <div>
                <div className="square" tabIndex={0} />
              </div>
            </div>
            <div className="visibility-test">
              <div className="case-name" tabIndex={0}>
                display: none
              </div>
              <div>
                <ArcShouldNotFocus style={{ display: 'none' }} />
              </div>
            </div>
            <div className="visibility-test">
              <div className="case-name" tabIndex={0}>
                parent display: none
              </div>
              <div style={{ display: 'none' }}>
                <ArcShouldNotFocus />
              </div>
            </div>
          </div>
          {this.state.isDialogVisible ? <Dialog onClose={this.onDialogClose} /> : null}
        </div>
      );
    }
  },
);

render(<MyApp />, document.getElementById('app'));
