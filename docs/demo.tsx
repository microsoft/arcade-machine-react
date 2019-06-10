import * as React from 'react';
import { Highlighted } from './highlighted';
import * as styles from './demo.component.scss';

interface IProps {
  name: string;
}

const massageSource = (source: string) => {
  return source.replace(/(\.\.\/)+src/g, '@mixer/arcade-machine-react');
};

const enum Tab {
  DemoHidden,
  DemoVisible,
  Code,
}

interface IState {
  tab: Tab;
}

let hidePrevious: (() => void) | undefined;

export class Demo extends React.PureComponent<IProps, IState> {
  public state: IState = { tab: Tab.DemoHidden };

  public render() {
    const { default: Component } = require(`./demos/${this.props.name}`);
    const { default: source } = require(`!!raw-loader!./demos/${this.props.name}`);

    return (
      <div className={styles.wrapper}>
        <ol className={styles.tabs}>
          <li
            className={this.state.tab !== Tab.Code ? styles.active : undefined}
            onClick={this.openDemo}
          >
            Demo
          </li>
          <li
            className={this.state.tab === Tab.Code ? styles.active : undefined}
            onClick={this.openCode}
          >
            Source
          </li>
        </ol>
        {this.state.tab === Tab.Code && (
          <div className={styles.code}>
            <Highlighted code={massageSource(source)} />
          </div>
        )}
        {this.state.tab === Tab.DemoVisible && (
          <div className={styles.demo}>
            <Component />
          </div>
        )}
        {this.state.tab === Tab.DemoHidden && (
          <div className={styles.demoHidden} onClick={this.openDemo}>
            Click to Open Demo
          </div>
        )}
      </div>
    );
  }

  private readonly hideDemo = () => {
    this.setState({ tab: Tab.DemoHidden });

    if (hidePrevious === this.hideDemo) {
      hidePrevious = undefined;
    }
  };

  private readonly openDemo = () => {
    if (!hidePrevious || hidePrevious === this.hideDemo) {
      this.setState({ tab: Tab.DemoVisible });
      hidePrevious = this.hideDemo;
    } else {
      hidePrevious();
      setTimeout(this.openDemo, 100);
    }
  };

  private readonly openCode = () => {
    this.setState({ tab: Tab.Code });

    if (hidePrevious === this.hideDemo) {
      hidePrevious = undefined;
    }
  };
}
