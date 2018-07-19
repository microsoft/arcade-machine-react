import { ArcAutoFocus, ArcUp, ArcDown } from '../../src';
import * as React from 'react';

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

export class FocusHooksDemo extends React.Component<{}, { showAFBox: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { showAFBox: true };
  }

  private readonly toggleAFBox = () => {
    this.setState({ showAFBox: false });
    setTimeout(() => this.setState({ ...this.state, showAFBox: true }), 1000);
  };

  public render() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}
