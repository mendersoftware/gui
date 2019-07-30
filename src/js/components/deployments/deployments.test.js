import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Deployments from './deployments';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Deployments location={{ search: '' }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
