import React from 'react';
import renderer from 'react-test-renderer';
import ProgressChart from './progressChart';

it('renders correctly', () => {
  const tree = renderer.create(<ProgressChart deployment={{ created: Date.now() }} device={{ status: 'installing' }} />).toJSON();
  expect(tree).toMatchSnapshot();
});
