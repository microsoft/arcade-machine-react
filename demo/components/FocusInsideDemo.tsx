import { FocusArea, FocusExclude } from '../../src';
import * as React from 'react';

export const FocusInsideDemo = () => (
  <React.Fragment>
    <h1>Focus Inside</h1>
    Transfer focus to elements inside me
    <div className="area" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        With arc-focus-inside
        <FocusArea>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
          </div>
        </FocusArea>
        <FocusArea>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} style={{ marginLeft: '100px' }} />
          </div>
        </FocusArea>
        <FocusArea>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
          </div>
        </FocusArea>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        With focus excluded
        <FocusExclude>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
          </div>
        </FocusExclude>
        <FocusExclude>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} style={{ marginLeft: '100px' }} />
          </div>
        </FocusExclude>
        <FocusExclude>
          <div id="focus-inside1" className="area">
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
            <div className="square" tabIndex={0} />
          </div>
        </FocusExclude>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Without arc-focus-inside
        <div id="focus-inside1" className="area">
          <div className="square" tabIndex={0} />
          <div className="square" tabIndex={0} />
          <div className="square" tabIndex={0} />
        </div>
        <div id="focus-inside1" className="area">
          <div className="square" tabIndex={0} />
          <div
            className="square"
            tabIndex={0}
            style={{
              display: 'inline-block',
              width: '50px',
              height: '50px',
              marginLeft: '100px',
            }}
          />
        </div>
        <div id="focus-inside1" className="area">
          <div className="square" tabIndex={0} />
          <div className="square" tabIndex={0} />
          <div className="square" tabIndex={0} />
        </div>
      </div>
    </div>
  </React.Fragment>
);
