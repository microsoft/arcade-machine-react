import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Composable, renderComposed } from '../internal-types';
import { instance } from '../singleton';

/**
 * Scrollable marks the associated DOM node as being a scroll container for
 * arcade-machine. This will cause arcade-machine to ensure that, within these
 * scroll containers, any focused element is visible.
 */
export class Scrollable extends React.PureComponent<{
  children: React.ReactNode;
  horizontal: boolean;
  vertical: boolean;
}> {
  /**
   * The node this element is attached to.
   */
  private node!: HTMLElement;

  public componentDidMount() {
    const element = ReactDOM.findDOMNode(this);
    if (!(element instanceof HTMLElement)) {
      throw new Error(
        `Attempted to mount an <ArcScrollable /> not attached to an element, got ${element}`,
      );
    }

    this.node = element;
    instance.getServices().scrollRegistry.add({
      element,
      horizontal: this.props.horizontal,
      vertical: this.props.vertical,
    });
  }

  public componentWillUnmount() {
    instance.getServices().scrollRegistry.remove(this.node);
  }

  public render() {
    return this.props.children;
  }
}

/**
 * HOC to create a Scrollable.
 */
export const ArcScrollable = <P extends {} = {}>(
  Composed: Composable<P>,
  vertical: boolean = true,
  horizontal: boolean = false,
) => (props: P) => (
  <Scrollable vertical={vertical} horizontal={horizontal}>
    {renderComposed(Composed, props)}
  </Scrollable>
);
