import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Devices from './devices';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Devices />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
