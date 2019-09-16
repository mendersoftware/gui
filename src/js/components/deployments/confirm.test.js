import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmAbort from './confirmabort';

it('renders correctly', () => {
  const tree = renderer.create(<Confirm type="abort" />).toJSON();
  expect(tree).toMatchSnapshot();
});
