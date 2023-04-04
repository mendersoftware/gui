import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ArtifactInformationForm, { ReleaseTooltip } from './artifactinformationform';

describe('ArtifactInformationForm Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactInformationForm activeStep={0} deviceTypes={[]} updateCreation={jest.fn} onboardingState={{ complete: false }} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('ReleaseTooltip Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ReleaseTooltip />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
