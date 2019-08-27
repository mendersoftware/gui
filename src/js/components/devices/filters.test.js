import React from 'react';
import renderer from 'react-test-renderer';
import Filters from './filters';

it('renders correctly', () => {
  const tree = renderer.create(<Filters attributes={[{ key: 'testkey', value: 'testvalue' }]} filters={[]} onFilterChange={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
