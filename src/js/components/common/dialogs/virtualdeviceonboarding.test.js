import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import VirtualDeviceOnboarding from './virtualdeviceonboarding';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <VirtualDeviceOnboarding />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
