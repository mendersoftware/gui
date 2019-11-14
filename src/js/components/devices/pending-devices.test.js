import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Pending } from './pending-devices';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Pending />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
