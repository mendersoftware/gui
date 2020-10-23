import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactMetadataList from './artifactmetadatalist';
import { undefineds } from '../../../../tests/mockData';

describe('ArtifactPayload Component', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<ArtifactMetadataList metaInfo={{ content: [{ key: 'custom-key', primary: 'primary text', secondary: 'secondary text' }], title: 'test' }} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
