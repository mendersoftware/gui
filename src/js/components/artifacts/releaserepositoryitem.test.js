import React from 'react';
import renderer from 'react-test-renderer';
import ReleaseRepositoryItem from './releaserepositoryitem';

it('renders correctly', () => {
  const tree = renderer.create(<ReleaseRepositoryItem artifact={{ device_types_compatible: ['test-type'], updates: [] }} onExpanded={() => {}} />).toJSON();
  expect(tree).toMatchSnapshot();
});
