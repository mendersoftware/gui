import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmRetry from './confirmretry';

it('renders correctly', () => {
  const tree = renderer.create(<ConfirmRetry />).toJSON();
  expect(tree).toMatchSnapshot();
});
