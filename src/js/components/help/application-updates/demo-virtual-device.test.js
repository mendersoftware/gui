import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import VirtualDevice from './demo-virtual-device';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <VirtualDevice />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
