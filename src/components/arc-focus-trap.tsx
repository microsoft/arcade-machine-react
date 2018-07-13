import * as React from 'react';
import {
  ArcContext,
  Composable,
  findElement,
  findFocusable,
  renderComposed,
  requireContext,
} from '../internal-types';
import { StateContainer } from '../state/state-container';

/**
 * Properties passed to the FocusTrap.
 */
export interface IFocusTrapProps {
  children: React.ReactNode;
  focusIn?: HTMLElement | string;
  focusOut?: HTMLElement | string;
}

/**
 * The ArcFocusTrap prevents focus from leaving the given area of the DOM,
 * until the trap is destroyed. When initially mounted, it will move
 * focus to the first focusable element inside of it, or the focusIn element,
 * if the focus hasn't yet been changed (i.e. if there's no other autofocused
 * element).
 *
 * When unmounted, it will give focus back to the element focused before the
 * trap was created, unless an override is given
 *
 * @example
 * <FocusTrap><MyContent /></FocusTrap>
 *
 * <FocusTrap focusIn=".submit" focusOut=".open-modal-button">
 *   <MyContent />
 * </FocusTrap>
 */
export class FocusTrap extends React.PureComponent<IFocusTrapProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private previouslyFocusedElement!: HTMLElement;
  private stateContainer!: StateContainer;

  private readonly withContext = requireContext(({ state }) => {
    this.stateContainer = state;
    return (
      <div className="arc-focus-trap" tabIndex={0} ref={this.containerRef}>
        {this.props.children}
      </div>
    );
  });

  public componentWillMount() {
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
  }

  public componentDidMount() {
    const element = this.containerRef.current!;

    // setTimeout to give time for any autofocusing to fire before we go
    // ahead and force the focus over.
    setTimeout(() => {
      if (!element.contains(document.activeElement)) {
        const next = findFocusable(element, this.props.focusIn);
        if (next) {
          next.focus();
        }
      }
    });

    this.stateContainer.add(this, {
      element,
      onOutgoing: ev => {
        if (ev.next && !element.contains(ev.next)) {
          ev.preventDefault();
        }
      },
    });
  }

  public componentWillUnmount() {
    this.stateContainer.remove(this, this.containerRef.current!);

    if (this.props.focusOut) {
      const target = findElement(document.body, this.props.focusOut);
      if (target) {
        target.focus();
        return
      }
    }

    this.previouslyFocusedElement.focus();
  }

  public render() {
    return <ArcContext.Consumer>{this.withContext}</ArcContext.Consumer>;
  }
}

/**
 * HOC to create a FocusTrap.
 */
export const ArcFocusTrap = <P extends {} = {}>(
  Composed: Composable<P>,
  focusIn?: HTMLElement | string,
) => (props: P) => <FocusTrap focusIn={focusIn}>{renderComposed(Composed, props)}</FocusTrap>;
