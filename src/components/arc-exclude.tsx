import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ArcContext, Composable, renderComposed, requireContext } from '../internal-types';
import { StateContainer } from '../state/state-container';

/**
 * FocusExclude will exclude the attached element, and optionally its
 * subtree, from taking any arcade-machine focus.
 */
export class FocusExclude extends React.PureComponent<{
  children: React.ReactNode;
  deep?: boolean;
}> {
  /**
   * Gets the HTMLElement this scope is attached to.
   */
  private stateContainer!: StateContainer;

  /**
   * The node this element is attached to.
   */
  private node!: HTMLElement;

  /**
   * Handler function called with the ArcContext state.
   */
  private readonly withContext = requireContext(({ state }) => {
    this.stateContainer = state;
    return this.props.children;
  });

  public componentDidMount() {
    const element = ReactDOM.findDOMNode(this);
    if (!(element instanceof HTMLElement)) {
      throw new Error(
        `Attempted to mount an <ArcScope /> not attached to an element, got ${element}`,
      );
    }

    this.stateContainer.add(this, {
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
    this.stateContainer.remove(this, this.node);
  }

  public render() {
    return <ArcContext.Consumer>{this.withContext}</ArcContext.Consumer>;
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
export const ArcFocusExclude = <P extends {} = {}>(
  Composed: Composable<P>,
  deep?: boolean,
) => (props: P) => <FocusExclude deep={deep}>{renderComposed(Composed, props)}</FocusExclude>;
