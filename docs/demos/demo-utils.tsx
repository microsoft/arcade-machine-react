import * as React from 'react';
import * as styles from './hello-world.component.scss';

export const repeat = <T extends {}>(n: number, fn: (i: number) => T): T[] => {
  const data: T[] = [];
  for (let i = 0; i < n; i++) {
    data.push(fn(i));
  }

  return data;
};

export const basicGrid = (width: number, height: number) => (
  <>
    {repeat(height, i => (
      <div className={styles.row} key={i}>
        {repeat(width, k => (
          <div className={styles.box} key={k} tabIndex={0} />
        ))}
      </div>
    ))}
  </>
);
