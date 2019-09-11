import React from 'react';
import renderer from 'react-test-renderer';
import DeviceList from './devicelist';

it('renders correctly', () => {
  const tree = renderer.create(<DeviceList devices={[]} selectedRows={[]} columnHeaders={[1, 2, 3, 4]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
