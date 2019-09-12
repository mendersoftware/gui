import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ApplicationUpdates from './application-updates';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <ApplicationUpdates />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
