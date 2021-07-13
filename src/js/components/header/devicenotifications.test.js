import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import DeviceNotifications from './devicenotifications';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <DeviceNotifications pending={10} total={100} limit={1000} />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
