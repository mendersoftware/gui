import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmAbort from './confirmabort';

it('renders correctly', () => {
  const tree = renderer.create(<ConfirmAbort />).toJSON();
  expect(tree).toMatchSnapshot();
});
