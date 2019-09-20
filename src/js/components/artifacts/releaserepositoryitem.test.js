import React from 'react';
import renderer from 'react-test-renderer';
import ReleaseRepositoryItem from './releaserepositoryitem';

it('renders correctly', () => {
  const tree = renderer
    .create(<ReleaseRepositoryItem artifact={{ device_types_compatible: ['test-type'], updates: [], modified: '2019-01-01' }} onExpanded={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
