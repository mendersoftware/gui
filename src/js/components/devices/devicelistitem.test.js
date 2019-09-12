import React from 'react';
import renderer from 'react-test-renderer';
import DeviceListItem from './devicelistitem';

it('renders correctly', () => {
  const tree = renderer.create(<DeviceListItem device={{ id: 1 }} columnHeaders={[{ render: () => {} }]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
