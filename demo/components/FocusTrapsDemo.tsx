import { ArcFocusTrap, FocusTrap } from '../../src';
import * as React from 'react';

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

export class FocusTrapsDemo extends React.Component<{}, { dialog: boolean }> {
  private readonly onDialogOpen = () => {
    this.setState({ dialog: true });
  };

  private readonly onDialogClose = () => {
    this.setState({ dialog: false });
  };

  public state = { dialog: false };

  render() {
    return (
      <React.Fragment>
        <h1>Focus Child Elements Only</h1>
        <button tabIndex={0} onClick={this.onDialogOpen}>
          Open Dialog
        </button>
        {this.state.dialog ? <Dialog onClose={this.onDialogClose} /> : null}
      </React.Fragment>
    );
  }
}
