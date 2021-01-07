import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ArtifactInformationForm, { ReleaseTooltip } from './artifactinformationform';
import { undefineds } from '../../../../../tests/mockData';

describe('ArtifactInformationForm Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<ArtifactInformationForm onboardingState={{ complete: false }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('ReleaseTooltip Component', () => {
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <ReleaseTooltip />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
