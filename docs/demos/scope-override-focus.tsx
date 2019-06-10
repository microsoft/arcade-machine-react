import * as React from 'react';
import { ArcRoot, defaultOptions, ArcScope } from '../../src';
import * as styles from './hello-world.component.scss';

export default ArcRoot(
  () => (
    <>
      <div className={styles.row}>
        <ArcScope arcFocusDown={'#center'} arcFocusUp={'#right'}>
          <div tabIndex={0} id="left" className={styles.box} />
        </ArcScope>
        <ArcScope arcFocusDown={'#right'} arcFocusUp={'#left'}>
          <div tabIndex={0} id="center" className={styles.box} />
        </ArcScope>
        <ArcScope arcFocusDown={'#left'} arcFocusUp={'#center'}>
          <div tabIndex={0} id="right" className={styles.box} />
        </ArcScope>
      </div>
    </>
  ),
  defaultOptions(),
);
