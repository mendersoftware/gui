import React from 'react';
import { render } from '@testing-library/react';
import DeviceInventoryLoader from './deviceinventoryloader';
import { undefineds } from '../../../../../tests/mockData';

describe('CreateGroup Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceInventoryLoader />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
