import React from 'react';
import renderer from 'react-test-renderer';
import { DeviceGroups } from './device-groups';

it('renders correctly', () => {
  const tree = renderer.create(<DeviceGroups />).toJSON();
  expect(tree).toMatchSnapshot();
});
