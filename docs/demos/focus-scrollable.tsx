import * as React from 'react';
import { ArcRoot, defaultOptions, Scrollable, VirtualElementStore } from '../../src';
import { basicGrid } from './demo-utils';

export default ArcRoot(
  () => (
    <>
      <b>Vertical Scrolling</b>
      <Scrollable>
        <div style={{ overflowY: 'scroll', height: 200, width: 500 }}>{basicGrid(5, 5)}</div>
      </Scrollable>
      <b>Horizontal Scrolling</b>
      <Scrollable horizontal vertical={false}>
        <div style={{ overflowX: 'scroll', height: 200, width: 500 }}>
          <div style={{ width: 2000 }}>{basicGrid(15, 2)}</div>
        </div>
      </Scrollable>
    </>
  ),
  { ...defaultOptions(), elementStore: new VirtualElementStore() },
);
