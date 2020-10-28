import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactUpload from './artifactupload';
import { undefineds } from '../../../../../tests/mockData';

describe('ArtifactUpload Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ArtifactUpload onboardingState={{ complete: true }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
