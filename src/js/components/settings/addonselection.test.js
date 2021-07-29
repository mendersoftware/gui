import React from 'react';
import { render } from '@testing-library/react';
import AddOnSelection from './addonselection';
import { undefineds } from '../../../../tests/mockData';

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
