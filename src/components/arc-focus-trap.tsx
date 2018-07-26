import * as React from 'react';
import { Composable, findElement, findFocusable, renderComposed } from '../internal-types';
import { instance } from '../singleton';

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

  public componentWillMount() {
    this.previouslyFocusedElement = instance.getServices().elementStore.element;
  }

  public componentDidMount() {
    const element = this.containerRef.current!;

    // setTimeout to give time for any autofocusing to fire before we go
    // ahead and force the focus over.
    setTimeout(() => {
      const store = instance.getServices().elementStore;
      if (!element.contains(store.element)) {
        const next = findFocusable(element, this.props.focusIn);
        if (next) {
          store.element = next;
        }
      }
    });

    instance.getServices().stateContainer.add(this, {
      element,
      onOutgoing: ev => {
        if (ev.next && !element.contains(ev.next)) {
          ev.preventDefault();
        }
      },
    });
  }

  public componentWillUnmount() {
    const { stateContainer, elementStore } = instance.getServices();
    stateContainer.remove(this, this.containerRef.current!);

    if (this.props.focusOut) {
      const target = findElement(document.body, this.props.focusOut);
      if (target) {
        elementStore.element = target;
        return;
      }
    }

    elementStore.element = this.previouslyFocusedElement;
  }

  public render() {
    return (
      <div className="arc-focus-trap" tabIndex={0} ref={this.containerRef}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * HOC to create a FocusTrap.
 */
export const ArcFocusTrap = <P extends {} = {}>(
  Composed: Composable<P>,
  focusIn?: HTMLElement | string,
) => (props: P) => <FocusTrap focusIn={focusIn}>{renderComposed(Composed, props)}</FocusTrap>;
