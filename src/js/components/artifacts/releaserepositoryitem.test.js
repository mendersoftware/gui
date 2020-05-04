import React from 'react';
import renderer from 'react-test-renderer';
import ReleaseRepositoryItem from './releaserepositoryitem';
import { undefineds } from '../../../../tests/mockData';

describe('ReleaseRepositoryItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<ReleaseRepositoryItem artifact={{ device_types_compatible: ['test-type'], updates: [], modified: '2019-01-01' }} onExpanded={() => {}} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
