import { IFocusOptions, IFocusStrategy } from '.';
import { Button, isHorizontal } from '../model';
import { isFocusable } from './dom-utils';

/**
 * PotentialElement is a FocusStrategy which uses element positions in the DOM
 * to determine the best next element to focus.
 */
class PotentialElement {
  public rect: ClientRect;
  public percentInShadow = 0;
  public primaryDistance = Infinity;
  public secondaryDistance = Infinity;

  constructor(public el: HTMLElement) {
    this.rect = this.el.getBoundingClientRect();
  }

  public calcPercentInShadow(refRect: ClientRect, dir: Button) {
    if (isHorizontal(dir)) {
      this.percentInShadow =
        Math.min(this.rect.bottom, refRect.bottom) - Math.max(this.rect.top, refRect.top);
    } else {
      this.percentInShadow =
        Math.min(this.rect.right, refRect.right) - Math.max(this.rect.left, refRect.left);
    }
  }

  public calcPrimaryDistance(refRect: ClientRect, dir: Button) {
    switch (dir) {
      case Button.Left:
        this.primaryDistance = refRect.left - this.rect.right;
        break;
      case Button.Right:
        this.primaryDistance = this.rect.left - refRect.right;
        break;
      case Button.Up:
        this.primaryDistance = refRect.top - this.rect.bottom;
        break;
      case Button.Down:
        this.primaryDistance = this.rect.top - refRect.bottom;
        break;
      default:
        throw new Error(`Invalid direction ${dir}`);
    }
  }

  public calcSecondaryDistance(refRect: ClientRect, dir: Button) {
    if (isHorizontal(dir)) {
      const refCenter = refRect.top + refRect.height / 2;
      const isAbove = this.rect.bottom < refCenter;

      this.secondaryDistance = isAbove ? refCenter - this.rect.bottom : this.rect.top - refCenter;
    } else {
      const refCenter = refRect.left + refRect.width / 2;
      const isLeft = this.rect.right < refCenter;

      this.secondaryDistance = isLeft ? refCenter - this.rect.right : this.rect.left - refCenter;
    }
  }
}

// tslint:disable-next-line
export class FocusByDistance implements IFocusStrategy {
  public findNextFocus({ referenceRect, direction, ignore, root, activeElement }: IFocusOptions) {
    const focusableElems = Array.from(root.querySelectorAll<HTMLElement>('[tabIndex]')).filter(
      el => !ignore.has(el) && isFocusable(el),
    );

    return new ElementFinder(direction, referenceRect, focusableElems, activeElement).find();
  }
}

// tslint:disable-next-line
export class ElementFinder {
  private shortlisted: PotentialElement[];

  constructor(
    private readonly dir: Button,
    private readonly refRect: ClientRect,
    candidates: HTMLElement[],
    private readonly prevEl?: HTMLElement,
  ) {
    this.shortlisted = candidates.map(candidate => new PotentialElement(candidate));
  }

  public find() {
    this.shortlisted = this.getElementsInDirection();
    this.shortlisted = this.shortlisted.filter(el => el.rect.width && el.rect.height);
    if (!this.shortlisted.length) {
      return null;
    }

    this.shortlisted.forEach(el => el.calcPercentInShadow(this.refRect, this.dir));

    const hasElementsInShadow = this.shortlisted.some(el => el.percentInShadow > 0);
    // Case: No elements in shadow
    //                   +------+
    //                   |      |
    //                   +------+
    // +---------+ --------------
    // |  X ->   |
    // +---------+---------------
    //              +------+   +------+
    //              |   X  |   |      |
    //              |      |   |      |
    //              +------+   +------+
    if (!hasElementsInShadow) {
      if (isHorizontal(this.dir)) {
        return null;
      }

      this.shortlisted.forEach(el => el.calcPrimaryDistance(this.refRect, this.dir));
      const shortestPrimaryDist = this.getShortestPrimaryDist(this.shortlisted);

      this.shortlisted = this.shortlisted.filter(el => el.primaryDistance === shortestPrimaryDist);
      this.shortlisted.forEach(el => el.calcSecondaryDistance(this.refRect, this.dir));

      // return the closest element on secondary axis
      return this.shortlisted.reduce(
        (prev, curr) => (curr.secondaryDistance <= prev.secondaryDistance ? curr : prev),
      ).el;
    }

    this.shortlisted = this.shortlisted.filter(el => el.percentInShadow > 0);
    this.shortlisted.forEach(el => el.calcPrimaryDistance(this.refRect, this.dir));
    const shortestDist = this.getShortestPrimaryDist(this.shortlisted);

    this.shortlisted = this.shortlisted.filter(el => el.primaryDistance === shortestDist);

    // Case: Multiple elements in shadow
    // +---------+ -------------------------
    // |         |                +------+
    // |         |                |      |
    // |  X ->   |                |      |
    // |         |                +------+
    // |         |   +------+
    // +---------+--------------------------
    //               |      |
    //               +------+
    if (this.shortlisted.length === 1) {
      return this.shortlisted[0].el;
    }

    // Case: Mutiple elements in shadow with equal distance
    // +---------++------+
    // |         ||      |
    // |         ||      |
    // |  X ->   |+------+
    // |         ||      |
    // |         ||      |
    // +---------++------+
    if (this.prevEl && this.shortlisted.some(el => el.el === this.prevEl)) {
      return this.prevEl;
    }

    if (isHorizontal(this.dir)) {
      // return top most element
      return this.shortlisted.reduce((prev, curr) => (curr.rect.top < prev.rect.top ? curr : prev))
        .el;
    } else {
      // return top left element
      return this.shortlisted.reduce(
        (prev, curr) => (curr.rect.left < prev.rect.left ? curr : prev),
      ).el;
    }
  }

  private getElementsInDirection() {
    return this.shortlisted.filter(el => {
      switch (this.dir) {
        case Button.Left:
          return el.rect.right <= this.refRect.left;
        case Button.Right:
          return el.rect.left >= this.refRect.right;
        case Button.Up:
          return el.rect.bottom <= this.refRect.top;
        case Button.Down:
          return el.rect.top >= this.refRect.bottom;
        default:
          throw new Error(`Invalid direction ${this.dir}`);
      }
    });
  }

  private getShortestPrimaryDist(elements: PotentialElement[]) {
    let shortestDist = elements[0].primaryDistance;
    for (const element of elements) {
      if (element.primaryDistance < shortestDist) {
        shortestDist = element.primaryDistance;
      }
    }
    return shortestDist;
  }
}
