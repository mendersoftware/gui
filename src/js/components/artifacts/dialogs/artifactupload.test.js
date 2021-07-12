import React from 'react';
import { render } from '@testing-library/react';
import ArtifactUpload from './artifactupload';
import { undefineds } from '../../../../../tests/mockData';

describe('ArtifactUpload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactUpload onboardingState={{ complete: true }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
