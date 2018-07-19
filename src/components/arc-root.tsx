import * as React from 'react';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IElementStore, IFocusStrategy } from '../focus';
import { FocusService } from '../focus-service';
import { FocusByDistance } from '../focus/focus-by-distance';
import { FocusByRegistry } from '../focus/focus-by-registry';
import { NativeElementStore } from '../focus/native-element-store';
import { InputService } from '../input';
import { GamepadInput } from '../input/gamepad-input';
import { IInputMethod } from '../input/input-method';
import { KeyboardInput } from '../input/keyboard-input';
import { Composable, renderComposed } from '../internal-types';
import { instance } from '../singleton';
import { StateContainer } from '../state/state-container';

/**
 * IRootOptions injects structures to use for focusing, taking input, and
 * so on. You can insert `defaultOptions()` if you want to stick with
 * the default set of providers.
 */
export interface IRootOptions {
  inputs: IInputMethod[];
  focus: IFocusStrategy[];
  elementStore: IElementStore;
}

/**
 * defaultOptions returns a default set of IRootOptions. This is not provided
 * implicitly in order to allow your bundler to tree-shake out any providers
 * you don't use in your app.
 */
export function defaultOptions(): IRootOptions {
  return {
    elementStore: new NativeElementStore(),
    focus: [new FocusByRegistry(), new FocusByDistance()],
    inputs: [new GamepadInput(), new KeyboardInput()],
  };
}

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
class Root extends React.PureComponent<IRootOptions> {
  private stateContainer = new StateContainer();
  private focus!: FocusService;
  private input!: InputService;
  private rootRef = React.createRef<HTMLDivElement>();
  private unmounted = new ReplaySubject<void>(1);

  constructor(props: IRootOptions) {
    super(props);

    instance.setServices({
      elementStore: this.props.elementStore,
      stateContainer: this.stateContainer,
    });
  }

  public componentDidMount() {
    const focus = (this.focus = new FocusService(
      this.stateContainer,
      this.rootRef.current!,
      this.props.focus,
      this.props.elementStore,
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
    instance.setServices(undefined);
  }

  public render() {
    return <div ref={this.rootRef}>{this.props.children}</div>;
  }
}

/**
 * HOC to create an arcade-machine Root element.
 */
export const ArcRoot = <P extends {}>(Composed: Composable<P>, options: IRootOptions) => (
  props: P,
) => <Root {...options}>{renderComposed(Composed, props)}</Root>;
