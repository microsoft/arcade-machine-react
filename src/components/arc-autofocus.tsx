import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Composable, renderComposed } from '../internal-types';

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
class AutoFocus extends React.PureComponent<{ selector?: string }> {
  public componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    if (!(node instanceof Element)) {
      return;
    }
    let focusTarget: Element | null = null;
    if (this.props.selector) {
      focusTarget = node.querySelector(this.props.selector);
    } else if (node.children.length) {
      focusTarget = node.children[0];
    } else {
      focusTarget = node;
    }

    if (focusTarget) {
      (focusTarget as HTMLElement).focus();
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
  Composed: Composable<P>,
  selector?: string,
) => (props: P) => <AutoFocus selector={selector}>{renderComposed(Composed, props)}</AutoFocus>;
