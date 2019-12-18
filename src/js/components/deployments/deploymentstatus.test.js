import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentStatus from './deploymentstatus';

it('renders correctly', () => {
  const tree = renderer.create(<DeploymentStatus refreshStatus={jest.fn()} />).toJSON();
  expect(tree).toMatchSnapshot();
});
