import * as React from 'react';
import { NavNode } from './tree';
import * as styles from './title.component.scss';

export const Title: React.FC<{ node: NavNode<any> }> = ({ node }) =>
  React.createElement(
    `h${node.depth}`,
    { id: node.link },
    <>
      <a href={`#${node.link}`} className={styles.link}>
        #
      </a>{' '}
      {node.title}
    </>,
  );
