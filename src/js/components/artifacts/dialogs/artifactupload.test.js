import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactUpload from './artifactupload';

describe('ArtifactUpload Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ArtifactUpload />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
