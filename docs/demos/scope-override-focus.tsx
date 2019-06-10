import * as React from 'react';
import { ArcRoot, defaultOptions, Scope } from '../../src';
import * as styles from './hello-world.component.scss';

export default ArcRoot(
  () => (
    <>
      <div className={styles.row}>
        <Scope arcFocusDown="#center" arcFocusUp="#right">
          <div tabIndex={0} id="left" className={styles.box} />
        </Scope>
        <Scope arcFocusDown="#right" arcFocusUp="#left">
          <div tabIndex={0} id="center" className={styles.box} />
        </Scope>
        <Scope arcFocusDown="#left" arcFocusUp="#center">
          <div tabIndex={0} id="right" className={styles.box} />
        </Scope>
      </div>
    </>
  ),
  defaultOptions(),
);
