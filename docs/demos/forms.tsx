import * as React from 'react';
import { ArcRoot, defaultOptions, VirtualElementStore } from '../../src';
import * as styles from './forms.component.scss';
import { basicGrid } from './demo-utils';

export default ArcRoot(
  () => (
    <>
      {basicGrid(5, 1)}
      <div className={styles.forms}>
        <div>{basicGrid(1, 3)}</div>
        <div style={{ flex: 1 }}>
          <label>Name</label>
          <input tabIndex={0} />
          <label>Favorite Console</label>
          <input type="radio" name="console" value={0} tabIndex={0} /> Xbox
          <input type="radio" name="console" value={1} tabIndex={0} /> PlayStation
          <label>Pineapple on Pizza?</label>
          <input type="checkbox" tabIndex={0} /> Yes Please
          <label>Favorite Games</label>
          <textarea tabIndex={0} />
          <br />
          <button onClick={() => alert('It works!')} tabIndex={0}>
            Submit
          </button>
        </div>
        <div>{basicGrid(1, 3)}</div>
      </div>
      {basicGrid(5, 1)}
    </>
  ),
  { ...defaultOptions(), elementStore: new VirtualElementStore() },
);
