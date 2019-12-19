import React from 'react';
import renderer from 'react-test-renderer';
import FilterItem from './filteritem';

describe('FilterItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<FilterItem filterAttributes={['test']} filter={{ key: 'testkey', value: 'testvalue' }} filters={[{ key: 'testkey', value: 'testvalue' }]} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
