import * as React from 'react';
import { ArcRoot, defaultOptions } from '../../src';
import * as styles from './hello-world.component.scss';
import { repeat } from './demo-utils';

export default ArcRoot(
  () => (
    <>
      {repeat(3, i => (
        <div className={styles.row} key={i}>
          {repeat(5, k => (
            <div className={styles.box} key={k} tabIndex={0} />
          ))}
        </div>
      ))}
    </>
  ),
  defaultOptions(),
);
