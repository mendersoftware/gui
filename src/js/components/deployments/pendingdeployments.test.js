import React from 'react';
import renderer from 'react-test-renderer';
import Pending from './pendingdeployments';

it('renders correctly', () => {
  const tree = renderer.create(<Pending pending={[]} refreshPending={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
