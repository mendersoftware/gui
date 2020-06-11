import React from 'react';
import renderer from 'react-test-renderer';
import FilterItem from './filteritem';
import { undefineds } from '../../../../tests/mockData';

describe('FilterItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <FilterItem filterAttributes={['test']} filter={{ key: 'testkey', value: 'testvalue' }} filters={[{ key: 'testkey', value: 'testvalue' }]} attributes={[{ key: 'testkey', value: 'testvalue' }]} index={0} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
