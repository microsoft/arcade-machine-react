import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Composable, renderComposed } from '../internal-types';
import { instance } from '../singleton';

/**
 * FocusExclude will exclude the attached element, and optionally its
 * subtree, from taking any arcade-machine focus.
 */
export class FocusExclude extends React.PureComponent<{
  children: React.ReactNode;
  deep?: boolean;
}> {
  /**
   * The node this element is attached to.
   */
  private node!: HTMLElement;

  public componentDidMount() {
    const element = ReactDOM.findDOMNode(this);
    if (!(element instanceof HTMLElement)) {
      throw new Error(
        `Attempted to mount an <ArcScope /> not attached to an element, got ${element}`,
      );
    }

    instance.getServices().stateContainer.add(this, {
      element,
      onIncoming: ev => {
        if (!ev.next) {
          return;
        }

        const exclusions = new Set<HTMLElement>();
        while (this.isElementExcluded(ev.next)) {
          exclusions.add(ev.next!);
          ev.next = ev.focusContext.find(undefined, exclusions);
        }
      },
    });

    this.node = element;
  }

  public componentWillUnmount() {
    instance.getServices().stateContainer.remove(this, this.node);
  }

  public render() {
    return this.props.children;
  }

  private isElementExcluded(element: HTMLElement | null): boolean {
    if (!element) {
      return false;
    }

    if (this.props.deep !== false) {
      return this.node.contains(element);
    }

    return this.node === element;
  }
}

/**
 * HOC to create a FocusExclude.
 */
export const ArcFocusExclude = <P extends {} = {}>(Composed: Composable<P>, deep?: boolean) => (
  props: P,
) => <FocusExclude deep={deep}>{renderComposed(Composed, props)}</FocusExclude>;
