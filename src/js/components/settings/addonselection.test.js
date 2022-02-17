import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import AddOnSelection from './addonselection';

describe('AddOnSelection component', () => {
  it(`renders correctly`, () => {
    const { baseElement } = render(
      <AddOnSelection addOns={[{ name: 'configure', enabled: true }]} features={{ hasDeviceConfig: true, hasDeviceConnect: true }} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
