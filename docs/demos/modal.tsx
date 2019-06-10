import * as React from 'react';
import { ArcRoot, defaultOptions, FocusTrap, ArcScope, Button } from '../../src';
import * as styles from './modal.component.scss';
import { basicGrid } from './demo-utils';

export default ArcRoot(() => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={styles.demo}>
      <button onClick={() => setOpen(true)} tabIndex={0}>
        Open Modal
      </button>
      {basicGrid(5, 2)}
      {open && (
        <FocusTrap>
          <ArcScope onButton={ev => ev.event === Button.Back && setOpen(false)}>
            <div className={styles.modal}>
              <div className={styles.inner}>
                This is a modal!
                {basicGrid(5, 2)}
                <button onClick={() => setOpen(false)} tabIndex={0}>
                  Close
                </button>
              </div>
            </div>
          </ArcScope>
        </FocusTrap>
      )}
    </div>
  );
}, defaultOptions());
