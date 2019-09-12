import React from 'react';
import renderer from 'react-test-renderer';
import Schedule from './schedule';

it('renders correctly', () => {
  const tree = renderer.create(<Schedule schedule={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
