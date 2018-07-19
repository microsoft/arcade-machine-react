import * as React from 'react';
import { ArcOnIncoming } from '../../src';

const ShouldNotFocus = ArcOnIncoming(
  ev => alert(`Unexpected incoming focus in: ${ev.next!.parentElement!.innerHTML}`),
  (props: { style?: any }) => <div className="square" tabIndex={0} {...props} />,
);

export const FocusHiddenDemo = () => (
  <React.Fragment>
    <h1>Hidden Boxes</h1>
    To the right of each description is an invisible box. These should not be focusable, and will
    alert if you try to focus them.
    <div className="area">
      <div className="visibility-test">
        <div className="case-name" tabIndex={0}>
          base case (should focus)
        </div>
        <div>
          <div className="square" tabIndex={0} />
        </div>
      </div>
      <div className="visibility-test">
        <div className="case-name" tabIndex={0}>
          display: none
        </div>
        <div>
          <ShouldNotFocus style={{ display: 'none' }} />
        </div>
      </div>
      <div className="visibility-test">
        <div className="case-name" tabIndex={0}>
          parent display: none
        </div>
        <div style={{ display: 'none' }}>
          <ShouldNotFocus />
        </div>
      </div>
    </div>
  </React.Fragment>
);
