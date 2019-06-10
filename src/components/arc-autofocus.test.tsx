import { expect } from 'chai';
import * as React from 'react';

import { NativeElementStore } from '../focus/native-element-store';
import { instance } from '../singleton';
import { ArcAutoFocus } from './arc-autofocus';
import { mountToDOM } from './util.test';

const NormalInput = (props: { className: string }) => (
  <input tabIndex={0} className={props.className} />
);
const FocusedInput = ArcAutoFocus(NormalInput);

describe('ArcAutoFocus', () => {
  beforeEach(() => {
    instance.setServices({
      elementStore: new NativeElementStore(),
    });
  });

  it('focuses the first html element', async () => {
    mountToDOM(
      <div>
        <NormalInput className="not-focused" />
        <FocusedInput className="focused" />
      </div>,
    );

    expect(document.activeElement!.className).to.deep.equal('focused');
  });

  it('focuses via selector', () => {
    const Fixture = ArcAutoFocus(
      () => (
        <div>
          <NormalInput className="not-focused" />
          <NormalInput className="focused" />,
        </div>
      ),
      '.focused',
    );
    mountToDOM(
      <div>
        <Fixture />
      </div>,
    );
    expect(document.activeElement!.className).to.deep.equal('focused');
  });
});
