import React from 'react';
import renderer from 'react-test-renderer';
import ProgressDeviceList from './deploymentdevicelist';

it('renders correctly', () => {
  const tree = renderer.create(<ProgressDeviceList />).toJSON();
  expect(tree).toMatchSnapshot();
});
