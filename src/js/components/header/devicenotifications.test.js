import React from 'react';
import DeviceNotifications from './devicenotifications';
import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceNotifications pending={10} total={100} limit={1000} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
