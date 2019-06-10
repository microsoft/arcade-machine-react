import * as React from 'react';
import { findFocusable } from '../internal-types';
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
 * <AutoFocus><div class="myBox" tabIndex={0} /></AutoFocus>
 * <AutoFocus target='.my-node'>{contents}</AutoFocus>
 * <AutoFocus target={someHtmlElement}>{contents}</AutoFocus>
 */
export class AutoFocus extends React.PureComponent<
  { target?: string | HTMLElement; selector?: string | HTMLElement } & React.HTMLAttributes<
    HTMLDivElement
  >
> {
  private readonly container = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    const node = this.container.current;
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const focusTarget = findFocusable(node, this.props.target);
    if (focusTarget) {
      instance.getServices().elementStore.element = focusTarget;
    }
  }

  public render() {
    return <div ref={this.container}>{this.props.children}</div>;
  }
}

/**
 * HOC for the AutoFocus component.
 */
export const ArcAutoFocus = <P extends {} = {}>(
  Composed: React.ComponentType<P>,
  target?: string | HTMLElement,
) => (props: P) => (
  <AutoFocus target={target}>
    <Composed {...props} />
  </AutoFocus>
);
