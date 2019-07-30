import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmDecommission from './confirmdecommission';

it('renders correctly', () => {
  const tree = renderer.create(<ConfirmDecommission />).toJSON();
  expect(tree).toMatchSnapshot();
});
