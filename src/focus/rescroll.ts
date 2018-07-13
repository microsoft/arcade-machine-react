interface IReducedClientRect {
  top: number;
  left: number;
  height: number;
  width: number;
}

/**
 * Interpolation with quadratic speed up and slow down.
 */
function quad(start: number, end: number, progress: number): number {
  const diff = end - start;
  if (progress < 0.5) {
    return diff * (2 * progress ** 2) + start;
  } else {
    const displaced = progress - 1;
    return diff * (-2 * displaced ** 2 + 1) + start;
  }
}

export function rescroll(
  el: HTMLElement,
  referenceRect: ClientRect,
  scrollSpeed: number | null,
  container: HTMLElement,
) {
  // Abort if scrolling is disabled.
  if (scrollSpeed === null) {
    return;
  }

  // Animation function to transition a scroll on the `parent` from the
  // `original` value to the `target` value by calling `set.
  const animate = (
    parentElement: HTMLElement,
    target: number,
    original: number,
    setter: (x: number) => void,
  ) => {
    if (scrollSpeed === Infinity) {
      parentElement.scrollTop = target;
      return;
    }

    const start = performance.now();
    const duration = (Math.abs(target - original) / scrollSpeed) * 1000;
    const run = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setter(quad(original, target, progress));

      if (progress < 1) {
        requestAnimationFrame(run);
      }
    };

    requestAnimationFrame(run);
  };

  // The scroll calculation loop. Starts at the element and goes up, ensuring
  // that the element (or the box where the element will be after scrolling
  // is applied) is visible in all containers.
  const { width, height, top, left } = referenceRect;

  let parent = el.parentElement;
  while (parent != null && parent !== container.parentElement) {
    // Special case: treat the body as the viewport as far as scrolling goes.
    let prect: IReducedClientRect;
    if (parent === container) {
      const containerStyle = window.getComputedStyle(container, undefined);
      const paddingTop = containerStyle.paddingTop
        ? Number(containerStyle.paddingTop.slice(0, -2))
        : 0;
      const paddingBottom = containerStyle.paddingBottom
        ? Number(containerStyle.paddingBottom.slice(0, -2))
        : 0;
      const paddingLeft = containerStyle.paddingLeft
        ? Number(containerStyle.paddingLeft.slice(0, -2))
        : 0;
      const paddingRight = containerStyle.paddingRight
        ? Number(containerStyle.paddingRight.slice(0, -2))
        : 0;
      prect = {
        height: container.clientHeight - paddingTop - paddingBottom,
        left: paddingLeft,
        top: paddingTop,
        width: container.clientWidth - paddingLeft - paddingRight,
      };
    } else {
      prect = parent.getBoundingClientRect();
    }

    // Trigger if this element has a vertical scrollbar
    if (parent.scrollHeight > parent.clientHeight) {
      const scrollTop = parent.scrollTop;
      const showsTop = scrollTop + (top - prect.top);
      const showsBottom = showsTop + (height - prect.height);

      if (showsTop < scrollTop) {
        animate(parent, showsTop, scrollTop, x => ((parent as HTMLElement).scrollTop = x));
      } else if (showsBottom > scrollTop) {
        animate(parent, showsBottom, scrollTop, x => ((parent as HTMLElement).scrollTop = x));
      }
    }

    // Trigger if this element has a horizontal scrollbar
    if (parent.scrollWidth > parent.clientWidth) {
      const scrollLeft = parent.scrollLeft;
      const showsLeft = scrollLeft + (left - prect.left);
      const showsRight = showsLeft + (width - prect.width);

      if (showsLeft < scrollLeft) {
        animate(parent, showsLeft, scrollLeft, x => ((parent as HTMLElement).scrollLeft = x));
      } else if (showsRight > scrollLeft) {
        animate(parent, showsRight, scrollLeft, x => ((parent as HTMLElement).scrollLeft = x));
      }
    }
    parent = parent.parentElement;
  }
}
