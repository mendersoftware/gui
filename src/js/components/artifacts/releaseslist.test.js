import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesList from './releaseslist';

it('renders correctly', () => {
  const tree = renderer.create(<ReleasesList releases={[]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
