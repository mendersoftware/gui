import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesList from './releaseslist';
import { undefineds } from '../../../../tests/mockData';

describe('ReleasesList Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<ReleasesList releases={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
