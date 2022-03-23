import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceListItem from './devicelistitem';

describe('DeviceListItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceListItem device={{ id: 1 }} columnHeaders={[{ render: item => item }]} idAttribute="id" selectable />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
