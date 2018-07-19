import * as React from 'react';

export const FocusGridDemo = () => (
  <React.Fragment>
    <h1>A Grid</h1>
    <div className="area">
      <div>
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
        <div className="square" tabIndex={0} />
      </div>
      <div>
        <div className="square" tabIndex={0} />
      </div>
    </div>
  </React.Fragment>
);
