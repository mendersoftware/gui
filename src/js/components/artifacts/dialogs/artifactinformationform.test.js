import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactInformationForm from './artifactinformationform';
import { undefineds } from '../../../../../tests/mockData';

describe('ArtifactInformationForm Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ArtifactInformationForm onboardingState={{ complete: true }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
