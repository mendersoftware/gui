import React from 'react';
import renderer from 'react-test-renderer';
import Authorized from './authorized-devices';

it('renders correctly', () => {
  const tree = renderer.create(<Authorized devices={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
