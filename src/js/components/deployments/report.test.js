import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeploymentReport from './report';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <DeploymentReport deployment={{ artifact_name: 'test' }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
