import * as React from 'react';
import { ArcRoot, defaultOptions, FocusArea } from '../../src';
import * as styles from './hello-world.component.scss';
import { repeat } from './demo-utils';

export default ArcRoot(
  () => (
    <>
      {repeat(3, i => (
        <React.Fragment key={i}>
          <b>Content Row {i + 1}</b>
          <FocusArea className={styles.row} focusIn="[data-nth='0']">
            {repeat(5, k => (
              <div className={styles.box} data-nth={k} key={k} tabIndex={0} />
            ))}
          </FocusArea>
        </React.Fragment>
      ))}
    </>
  ),
  defaultOptions(),
);
