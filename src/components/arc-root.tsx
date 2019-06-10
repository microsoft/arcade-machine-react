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
import { RootStore } from '../root-store';
import { IScrollingAlgorithm, ScrollExecutor } from '../scroll';
import { NativeSmoothScrollingAlgorithm } from '../scroll/native-smooth-scrolling';
import { ScrollRegistry } from '../scroll/scroll-registry';
import { SmoothScrollingAlgorithm } from '../scroll/smooth-scrolling-algorithm';
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
  scrolling: IScrollingAlgorithm;
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
    scrolling: new NativeSmoothScrollingAlgorithm(new SmoothScrollingAlgorithm()),
  };
}

interface IState {
  showChildren: boolean;
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
export class Root extends React.PureComponent<IRootOptions, IState> {
  public state = { showChildren: false };
  private focus?: FocusService;
  private stateContainer = new StateContainer();
  private scrollRegistry = new ScrollRegistry();
  private unmounted = new ReplaySubject<void>(1);

  constructor(props: IRootOptions) {
    super(props);
  }

  public componentDidUpdate(_: IRootOptions, prevState: IState) {
    if (this.state.showChildren && !prevState.showChildren && this.focus) {
      this.focus.setDefaultFocus();
    }
  }

  public componentWillUnmount() {
    this.unmounted.next();
    instance.setServices(undefined);
  }

  public render() {
    return <div ref={this.setRoot}>{this.state.showChildren && this.props.children}</div>;
  }

  private readonly setRoot = (rootElement: HTMLDivElement | null) => {
    if (!rootElement) {
      return;
    }

    const root = new RootStore(rootElement);

    instance.setServices({
      elementStore: this.props.elementStore,
      root,
      scrollRegistry: this.scrollRegistry,
      stateContainer: this.stateContainer,
    });

    const focus = (this.focus = new FocusService(
      this.stateContainer,
      root,
      this.props.focus,
      this.props.elementStore,
      new ScrollExecutor(this.scrollRegistry, this.props.scrolling),
    ));

    const input = new InputService(this.props.inputs);
    input.events.pipe(takeUntil(this.unmounted)).subscribe(({ button, event }) => {
      if (focus.sendButton(button) && event) {
        event.preventDefault();
      }
    });

    this.setState({ showChildren: true });
  };
}

/**
 * HOC to create an arcade-machine Root element.
 */
export const ArcRoot = <P extends {}>(Composed: React.ComponentType<P>, options: IRootOptions) => (
  props: P,
) => (
  <Root {...options}>
    <Composed {...props} />
  </Root>
);
