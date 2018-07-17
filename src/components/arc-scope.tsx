import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ArcEvent } from '../arc-event';
import { ArcContext, Composable, requireContext } from '../internal-types';
import { IArcHandler } from '../model';
import { StateContainer } from '../state/state-container';

const isArcScopeSymbol = Symbol();

interface IArcScopeClass<P> extends React.ComponentClass<P> {
  options: Partial<IArcHandler>;
  [isArcScopeSymbol]: true;
}

function isArcScope(type: any): type is IArcScopeClass<any> {
  return type[isArcScopeSymbol] === true;
}

/**
 * ArcScope configures the arcade-machine options used for components
 * nested/composed inside of it.
 */
export const ArcScope = <P extends {} = {}>(
  Composed: Composable<P>,
  options: Partial<IArcHandler>,
): React.ComponentClass<P> => {
  // We collapse multiple combined scopes together, in an optimization
  // for nested HOCs.
  if (isArcScope(Composed)) {
    Composed.options = { ...Composed.options, ...options };
    return Composed as React.ComponentClass<P>;
  }

  return class ArcScopeComponent extends React.PureComponent<P> {
    /**
     * Symbole to denote collapsable classes of this type.
     */
    public static [isArcScopeSymbol] = true;

    /**
     * Options, modified during composition.
     */
    public static options = options;

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
      return typeof Composed === 'function' ? <Composed {...this.props} /> : Composed;
    });

    public componentDidMount() {
      const node = ReactDOM.findDOMNode(this);
      if (!(node instanceof HTMLElement)) {
        throw new Error(
          `Attempted to mount an <ArcScope /> not attached to an element, got ${node}`,
        );
      }

      this.stateContainer.add(this, { element: node, ...ArcScopeComponent.options });
      this.node = node;
    }

    public componentWillUnmount() {
      this.stateContainer.remove(this, this.node);
    }

    public render() {
      return <ArcContext.Consumer>{this.withContext}</ArcContext.Consumer>;
    }
  };
};

/**
 * Overrides the element focused when going up from this element.
 */
export const ArcUp = <P extends {} = {}>(target: HTMLElement | string, composed: Composable<P>) =>
  ArcScope(composed, { arcFocusUp: target });

/**
 * Overrides the element focused when going left from this element.
 */
export const ArcLeft = <P extends {} = {}>(target: HTMLElement | string, composed: Composable<P>) =>
  ArcScope(composed, { arcFocusLeft: target });

/**
 * Overrides the element focused when going down from this element.
 */
export const ArcDown = <P extends {} = {}>(target: HTMLElement | string, composed: Composable<P>) =>
  ArcScope(composed, { arcFocusDown: target });

/**
 * Overrides the element focused when going right from this element.
 */
export const ArcRight = <P extends {} = {}>(
  target: HTMLElement | string,
  composed: Composable<P>,
) => ArcScope(composed, { arcFocusRight: target });

/**
 * Excludes the composed element from being focusable
 */
export const ArcExcludeThis = <P extends {} = {}>(composed: Composable<P>) =>
  ArcScope(composed, { excludeThis: true });

/**
 * Excludes the composed element and all children from being focusable
 */
export const ArcExcludeDeep = <P extends {} = {}>(composed: Composable<P>) =>
  ArcScope(composed, { exclude: true });

/**
 * Called with an IArcEvent focus is about
 * to leave this element or one of its children.
 */
export const ArcOnOutgoing = <P extends {} = {}>(
  handler: (ev: ArcEvent) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onOutgoing: handler });

/**
 * Called with an IArcEvent focus is about
 * to enter this element or one of its children.
 */
export const ArcOnIncoming = <P extends {} = {}>(
  handler: (ev: ArcEvent) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onIncoming: handler });

/**
 * Triggers a focus change event.
 */
export const ArcOnFocus = <P extends {} = {}>(
  handler: (el: HTMLElement | null) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onFocus: handler });
