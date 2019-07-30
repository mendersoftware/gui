import React from 'react';
import renderer from 'react-test-renderer';
import ReleaseRepository from './releaserepository';

it('renders correctly', () => {
  const tree = renderer.create(<ReleaseRepository artifacts={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
