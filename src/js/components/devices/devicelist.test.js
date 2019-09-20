import React from 'react';
import renderer from 'react-test-renderer';
import DeviceList from './devicelist';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <DeviceList
        devices={[]}
        selectedRows={[]}
        columnHeaders={[{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]}
        columnWidth={100}
        pageLength={10}
        pageTotal={50}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
