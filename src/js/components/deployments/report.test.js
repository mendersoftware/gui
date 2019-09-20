import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import DeploymentReport from './report';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <DeploymentReport deployment={{ artifact_name: 'test', created: '2019-01-01', finished: '2019-01-01' }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
