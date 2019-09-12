import React from 'react';
import renderer from 'react-test-renderer';
import Artifacts from './artifacts';

it('renders correctly', () => {
  const tree = renderer.create(<Artifacts />).toJSON();
  expect(tree).toMatchSnapshot();
});
