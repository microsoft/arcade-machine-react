import * as React from 'react';

export const FocusFormDemo = () => (
  <React.Fragment>
    <h1>A Form</h1>
    <div className="area">
      <form>
        <div>
          <input tabIndex={0} placeholder="Username" />
        </div>
        <div>
          <input tabIndex={0} placeholder="Password" type="password" />
        </div>
        <div>
          <textarea tabIndex={0} />
        </div>
        <div>
          <button tabIndex={0}>Submit</button>
        </div>
      </form>
    </div>
  </React.Fragment>
);
