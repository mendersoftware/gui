import React from 'react';
import renderer from 'react-test-renderer';
import Deployments from './deployments';

it('renders correctly', () => {
  const tree = renderer.create(<Deployments />).toJSON();
  expect(tree).toMatchSnapshot();
});
