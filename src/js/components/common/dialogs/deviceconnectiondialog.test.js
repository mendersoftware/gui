import React from 'react';
import renderer from 'react-test-renderer';
import DeviceConnectionDialog from './deviceconnectiondialog';

it('renders correctly', () => {
  const tree = renderer.create(<DeviceConnectionDialog />).toJSON();
  expect(tree).toMatchSnapshot();
});
