import * as React from 'react';
import { FocusService } from '../focus-service';
import { InputService } from '../input';
import { ArcContext, Composable, renderComposed } from '../internal-types';
import { StateContainer } from '../state/state-container';

/**
 * HOC for defining the root of the arcade-machine. This should be wrapped
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
export const ArcRoot = <P extends {}>(Composed: Composable<P>) =>
  class ArcRootComponent extends React.PureComponent<P> {
    private stateContainer = new StateContainer();
    private rootRef = React.createRef<HTMLDivElement>();

    public componentDidMount() {
      const focus = new FocusService(this.stateContainer);
      new InputService(focus).bootstrap(this.rootRef.current!);
    }

    public render() {
      return (
        <ArcContext.Provider value={{ state: this.stateContainer }}>
          <div ref={this.rootRef}>
            {renderComposed(Composed, this.props)}
          </div>
        </ArcContext.Provider>
      );
    }
  };
