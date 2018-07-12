import * as React from 'react';
import { FocusService } from '../focus-service';
import { InputService } from '../input';
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
class Root extends React.PureComponent {
  private stateContainer = new StateContainer();
  private rootRef = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    const focus = new FocusService(this.stateContainer);
    new InputService(focus).bootstrap(this.rootRef.current!);
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
export const ArcRoot = <P extends {}>(Composed: Composable<P>) => (props: P) => (
  <Root>{renderComposed(Composed, props)}</Root>
);
