import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeviceNotifications from './devicenotifications';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <DeviceNotifications />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
