import { createContext, createElement } from 'react';
import { StateContainer } from './state/state-container';

/**
 * IArcContextValue is given in th ArcContext for nested arcade-machine
 * components to consume.
 */
export interface IArcContextValue {
  state: StateContainer;
}

/**
 * requireContext wraps the given function and throws if the context is null.
 */
export function requireContext<T>(fn: (value: IArcContextValue) => T) {
  return (value: IArcContextValue | null) => {
    if (value === null) {
      throw new Error(
        `A component attempted to use arcade-machine, but was not inside the ArcRoot`,
      );
    }

    return fn(value);
  };
}

/**
 * References the arcade-machine context within React.
 */
export const ArcContext = createContext<IArcContextValue | null>(null);

/**
 * Type for elements passed into a HOC.
 */
export type Composable<P> = React.ReactElement<any> | React.ComponentType<P>;

/**
 * renderComposed can be used in render() functions to output a composed element.
 */
export const renderComposed = <P>(composed: Composable<P>, props: P) =>
  typeof composed === 'function' ? createElement(composed, props) : composed;
