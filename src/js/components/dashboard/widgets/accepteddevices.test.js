import React from 'react';
import renderer from 'react-test-renderer';
import AcceptedDevices from './accepteddevices';

it('renders correctly', () => {
  const tree = renderer.create(<AcceptedDevices />).toJSON();
  expect(tree).toMatchSnapshot();
});
