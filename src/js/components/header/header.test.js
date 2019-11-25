import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Header } from './header';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
