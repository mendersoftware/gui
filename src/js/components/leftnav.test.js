import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import LeftNav from './leftnav';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <LeftNav />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
