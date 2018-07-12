import * as React from 'react';
import { ArcContext, Composable, renderComposed, requireContext } from '../internal-types';
import { StateContainer } from '../state/state-container';

/**
 * The ArcFocusArea acts as a virtual focus element which transfers focus
 * to child. Take, for example, a list of lists, like this:
 *
 * ```
 * Row A
 * ┌────────┐┌────────┐┌────────┐
 * └────────┘└────────┘└────────┘
 * Row B
 * ┌────────┐┌────────┐
 * └────────┘└────────┘
 * Row C
 * ┌────────┐┌────────┐┌────────┐
 * └────────┘└────────┘└────────┘
 * ```
 *
 * When focusing downwards from the first element in Row A (or, often, any
 * element from A) it's usually desirable to focus the first element in Row B
 * instead of focusing whatever happens to be geographically below that
 * element elsewhere on the page, such as the third item in Row C.
 *
 * This component allows you to wrap Row B in a virtual focus area, which
 * is detected by the focusing algorithm and can direct the focus to a
 * specified element -- the first box within the area, in this case.
 *
 * @example
 * <FocusArea>
 *   {myContent.map(content => <ContentElement data={content} />)}
 * </FocusArea>
 *
 * // You can focus a particular child, by passing a selector or HTMLElement.
 * <FocusArea focusIn=".target">
 *   {myContent.map(content => <ContentElement data={content} />)}
 * </FocusArea>
 */
export class FocusArea extends React.PureComponent<{
  children: React.ReactNode;
  focusIn?: HTMLElement | string;
}> {
  private containerRef = React.createRef<HTMLDivElement>();
  private stateContainer!: StateContainer;

  private readonly withContext = requireContext(({ state }) => {
    this.stateContainer = state;
    return (
      <div tabIndex={0} ref={this.containerRef}>
        {this.props.children}
      </div>
    );
  });

  public componentDidMount() {
    const element = this.containerRef.current!;
    this.stateContainer.add(this, {
      element,
      onIncoming: ev => {
        if (ev.target && element.contains(ev.target)) {
          return;
        }

        const target = this.props.focusIn || '[tabIndex]';
        if (typeof target !== 'string') {
          ev.next = target;
          return;
        }

        const child = element.querySelector(target);
        if (child) {
          ev.next = child as HTMLElement;
        }
      },
    });
  }

  public componentWillUnmount() {
    this.stateContainer.remove(this, this.containerRef.current!);
  }

  public render() {
    return <ArcContext.Consumer>{this.withContext}</ArcContext.Consumer>;
  }
}

/**
 * HOC to create a FocusArea.
 */
export const ArcFocusArea = <P extends {} = {}>(
  Composed: Composable<P>,
  focusIn?: HTMLElement | string,
) => (props: P) => <FocusArea focusIn={focusIn}>{renderComposed(Composed, props)}</FocusArea>;
