import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import ArtifactInformationForm, { ReleaseTooltip } from './artifactinformationform';
import { undefineds } from '../../../../../tests/mockData';

describe('ArtifactInformationForm Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactInformationForm customDeviceTypes={[]} onboardingState={{ complete: false }} />);
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});

describe('ReleaseTooltip Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <ReleaseTooltip />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
