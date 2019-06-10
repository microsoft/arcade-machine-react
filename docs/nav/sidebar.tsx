import * as React from 'react';
import { NavNode, Reference, flatten } from './tree';
import * as styles from './sidebar.component.scss';
import { Subscription, fromEvent } from 'rxjs';
import { map, filter, throttleTime } from 'rxjs/operators';

const SidebarNode: React.FC<{ node: NavNode<any>; active: string | null }> = ({ node, active }) => {
  const { title, link, depth, ...children } = node;
  const childKeys = Object.keys(children);

  return (
    <>
      <Reference className={active === link ? styles.active : undefined} node={node}>
        {title}
      </Reference>
      {childKeys.length > 0 && (
        <ol>
          {childKeys.map(key => (
            <li key={key}>
              <SidebarNode node={children[key]} active={active} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
};

export class Sidebar extends React.PureComponent<
  { node: NavNode<any> },
  { active: string | null }
> {
  public state: { active: string | null } = { active: null };
  private subscriptions: Subscription[] = [];
  private cachedPositions?: [NavNode<any>, number][];

  public componentDidMount() {
    this.subscriptions.push(
      fromEvent(window, 'scroll', { passive: true })
        .pipe(
          throttleTime(10),
          map(() => {
            const items = this.getPositions();
            const best = items.find(n => n[1] < window.scrollY + 50);
            return best ? best[0] : items[items.length - 1][0];
          }),
          filter(node => node !== this.state.active),
        )
        .subscribe(node => {
          this.setState({ active: node.link });
        }),
    );

    this.subscriptions.push(
      fromEvent(window, 'resize').subscribe(() => (this.cachedPositions = undefined)),
    );
  }

  public componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public render() {
    return (
      <div className={styles.sidebar}>
        <SidebarNode node={this.props.node} active={this.state.active} />
      </div>
    );
  }

  private getPositions = () => {
    if (this.cachedPositions) {
      return this.cachedPositions;
    }

    this.cachedPositions = [];
    for (const node of flatten(this.props.node)) {
      const el = document.getElementById(node.link);
      if (el) {
        this.cachedPositions.push([node, el.offsetTop]);
      }
    }

    this.cachedPositions.sort((a, b) => b[1] - a[1]);
    return this.cachedPositions;
  };
}
