import React from 'react';
import renderer from 'react-test-renderer';
import ArtifactInformationForm from './artifactinformationform';

describe('ArtifactInformationForm Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ArtifactInformationForm />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
