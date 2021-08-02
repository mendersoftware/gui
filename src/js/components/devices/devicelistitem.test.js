import React from 'react';
import { render } from '@testing-library/react';
import DeviceListItem from './devicelistitem';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceListItem Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceListItem device={{ id: 1 }} columnHeaders={[{ render: item => item }]} idAttribute={'id'} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
