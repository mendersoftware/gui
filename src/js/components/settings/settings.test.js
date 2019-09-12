import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import MyOrganization from './organization';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <MyOrganization />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
