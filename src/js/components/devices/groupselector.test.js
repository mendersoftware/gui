import React from 'react';
import renderer from 'react-test-renderer';
import GroupSelector from './groupselector';

it('renders correctly', () => {
  const tree = renderer.create(<GroupSelector groups={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
