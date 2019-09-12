import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmDismissHelptips from './confirmdismisshelptips';

it('renders correctly', () => {
  const tree = renderer.create(<ConfirmDismissHelptips />).toJSON();
  expect(tree).toMatchSnapshot();
});
