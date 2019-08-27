import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Login from './login';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Login location={{ state: { from: '' } }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
