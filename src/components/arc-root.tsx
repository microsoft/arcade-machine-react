import * as React from 'react';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IFocusStrategy } from '../focus';
import { FocusService } from '../focus-service';
import { FocusByDistance } from '../focus/focus-by-distance';
import { FocusByRegistry } from '../focus/focus-by-registry';
import { InputService } from '../input';
import { GamepadInput } from '../input/gamepad-input';
import { IInputMethod } from '../input/input-method';
import { KeyboardInput } from '../input/keyboard-input';
import { ArcContext, Composable, renderComposed } from '../internal-types';
import { StateContainer } from '../state/state-container';

/**
 * Component for defining the root of the arcade-machine. This should be wrapped
 * around the root of your application, or its content. Only components
 * contained within the ArcRoot will be focusable.
 *
 * @example
 *
 * class MyAppContext extends React.Component {
 *   // ...
 * }
 *
 * export default ArcRoot(MyAppContent);
 */
class Root extends React.PureComponent<{ inputs: IInputMethod[]; focus: IFocusStrategy[] }> {
  private stateContainer = new StateContainer();
  private focus!: FocusService;
  private input!: InputService;
  private rootRef = React.createRef<HTMLDivElement>();
  private unmounted = new ReplaySubject<void>(1);

  public componentDidMount() {
    const focus = (this.focus = new FocusService(
      this.stateContainer,
      this.rootRef.current!,
      this.props.focus,
    ));
    const input = (this.input = new InputService(this.props.inputs));

    input.events.pipe(takeUntil(this.unmounted)).subscribe(({ button, event }) => {
      if (focus.sendButton(button) && event) {
        event.preventDefault();
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted.next();
  }

  public render() {
    return (
      <ArcContext.Provider value={{ state: this.stateContainer }}>
        <div ref={this.rootRef}>{this.props.children}</div>
      </ArcContext.Provider>
    );
  }
}

/**
 * HOC to create an arcade-machine Root element.
 */
export const ArcRoot = <P extends {}>(
  Composed: Composable<P>,
  inputs: IInputMethod[] = [new GamepadInput(), new KeyboardInput()],
  focusStrategies: IFocusStrategy[] = [new FocusByRegistry(), new FocusByDistance()],
) => (props: P) => (
  <Root inputs={inputs} focus={focusStrategies}>
    {renderComposed(Composed, props)}
  </Root>
);
