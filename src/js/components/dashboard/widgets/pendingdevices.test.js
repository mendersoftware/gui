import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import PendingDevices from './pendingdevices';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <PendingDevices />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
