import React from 'react';
import renderer from 'react-test-renderer';
import Groups from './groups';

it('renders correctly', () => {
  const tree = renderer.create(<Groups groups={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
