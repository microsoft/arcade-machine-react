import * as React from 'react';
import { ArcRoot, defaultOptions, FocusExclude } from '../../src';
import * as styles from './hello-world.component.scss';
import { repeat } from './demo-utils';

export default ArcRoot(() => {
  const [excludeActive, setActive] = React.useState(true);

  return (
    <>
      <b>Normal Row</b>
      <div className={styles.row}>
        {repeat(5, k => (
          <div className={styles.box} key={k} tabIndex={0} />
        ))}
      </div>
      <b>Excluded Row (active={String(excludeActive)})</b>
      <FocusExclude deep active={excludeActive}>
        <div className={styles.row}>
          {repeat(5, k => (
            <div className={styles.box} key={k} tabIndex={0} />
          ))}
        </div>
      </FocusExclude>
      <b>Normal Row</b>
      <div className={styles.row}>
        {repeat(5, k => (
          <div className={styles.box} key={k} tabIndex={0} />
        ))}
      </div>
      <input
        type="checkbox"
        checked={excludeActive}
        onChange={ev => setActive(ev.target.checked)}
      />
      Exclusion is active?
    </>
  );
}, defaultOptions());
