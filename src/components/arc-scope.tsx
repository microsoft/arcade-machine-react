import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ArcEvent } from '../arc-event';
import { ArcFocusEvent } from '../arc-focus-event';
import { Composable, renderComposed } from '../internal-types';
import { IArcHandler } from '../model';
import { instance } from '../singleton';

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
     * The node this element is attached to.
     */
    private node!: HTMLElement;

    public componentDidMount() {
      const node = ReactDOM.findDOMNode(this);
      if (!(node instanceof HTMLElement)) {
        throw new Error(
          `Attempted to mount an <ArcScope /> not attached to an element, got ${node}`,
        );
      }

      instance
        .getServices()
        .stateContainer.add(this, { element: node, ...ArcScopeComponent.options });
      this.node = node;
    }

    public componentWillUnmount() {
      instance.getServices().stateContainer.remove(this, this.node);
    }

    public render() {
      return renderComposed(Composed, this.props);
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
 * Called with an IArcEvent focus is about
 * to leave this element or one of its children.
 */
export const ArcOnOutgoing = <P extends {} = {}>(
  handler: (ev: ArcFocusEvent) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onOutgoing: handler });

/**
 * Called with an IArcEvent focus is about
 * to enter this element or one of its children.
 */
export const ArcOnIncoming = <P extends {} = {}>(
  handler: (ev: ArcFocusEvent) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onIncoming: handler });

/**
 * Triggers a focus change event.
 */
export const ArcOnButton = <P extends {} = {}>(
  handler: (ev: ArcEvent) => void,
  composed: Composable<P>,
) => ArcScope(composed, { onButton: handler });
