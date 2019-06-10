import * as React from 'react';
import { ArcRoot, defaultOptions, AutoFocus } from '../../src';
import { basicGrid } from './demo-utils';

export default ArcRoot(() => {
  const [visible, setVisible] = React.useState(true);
  return (
    <>
      <button onClick={() => setVisible(!visible)} tabIndex={0}>
        Toggle Autofocus Area
      </button>
      {visible && <AutoFocus target='[data-box="1 1"]'>{basicGrid(5, 3)}</AutoFocus>}
    </>
  );
}, defaultOptions());
