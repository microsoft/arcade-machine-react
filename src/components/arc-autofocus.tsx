import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { findElement } from '../internal-types';
import { instance } from '../singleton';

/**
 * Component that autofocuses whatever is contained inside it. By default,
 * it will focus its first direct child, but can also take a selector
 * or try to focus itself as a fallback. It will only run focusing
 * when it's first mounted.
 *
 * Note: for elements that have it, you should use the React built-in
 * autoFocus instead -- this is not present for elements which aren't
 * usually focusable, however.
 *
 * @example
 * const box = ArcAutoFocus(<div class="myBox" tabIndex={0}>)
 */
class AutoFocus extends React.PureComponent<{ selector?: string | HTMLElement }> {
  public componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    if (!(node instanceof HTMLElement)) {
      return;
    }
    let focusTarget: Element | null = null;
    if (this.props.selector) {
      focusTarget = findElement(node, this.props.selector);
    } else if (node.children.length) {
      focusTarget = node.children[0];
    } else {
      focusTarget = node;
    }

    if (focusTarget) {
      instance.getServices().elementStore.element = focusTarget as HTMLElement;
    }
  }

  public render() {
    return this.props.children;
  }
}

/**
 * HOC for the AutoFocus component.
 */
export const ArcAutoFocus = <P extends {} = {}>(
  Composed: React.ComponentType<P>,
  selector?: string | HTMLElement,
) => (props: P) => (
  <AutoFocus selector={selector}>
    <Composed {...props} />
  </AutoFocus>
);
