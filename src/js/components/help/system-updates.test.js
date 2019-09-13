import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import SystemUpdates from './system-updates';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <SystemUpdates />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
