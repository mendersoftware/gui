import React from 'react';
import renderer from 'react-test-renderer';
import ReleasesArtifacts from './releases-and-artifacts';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('ReleasesArtifacts Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<ReleasesArtifacts {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
