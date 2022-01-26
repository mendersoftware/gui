import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ArtifactUpload from './artifactupload';

describe('ArtifactUpload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactUpload onboardingState={{ complete: true }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
