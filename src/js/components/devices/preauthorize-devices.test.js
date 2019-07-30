import React from 'react';
import renderer from 'react-test-renderer';
import Preauthorize from './preauthorize-devices';

it('renders correctly', () => {
  const tree = renderer.create(<Preauthorize />).toJSON();
  expect(tree).toMatchSnapshot();
});
