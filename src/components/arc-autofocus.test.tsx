import { mount } from 'enzyme';
import * as React from 'react';

import { ArcAutoFocus } from './arc-autofocus';

const NormalInput = (props: { className: string }) => <input className={props.className}/>;
const FocusedInput = ArcAutoFocus(NormalInput);

describe('ArcAutoFocus', () => {
  it('focuses the first html element', () => {
    const cmp = mount(<div>
      <NormalInput className="not-focused" />
      <FocusedInput className="focused" />
    </div>);

    expect(document.activeElement.className).toEqual('focused');
    cmp.unmount();
  });

  it('focuses via selector', () => {
    const Fixture = ArcAutoFocus(
      <div>
        <NormalInput className="not-focused" />
        <NormalInput className="focused" />,
      </div>,
      '.focused'
    );
    const cmp = mount(<div><Fixture /></div>);
    expect(document.activeElement.className).toEqual('focused');
    cmp.unmount();
  });
});
