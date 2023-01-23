import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ArtifactUpload from './artifactupload';

describe('ArtifactUpload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <ArtifactUpload creation={{ file: { name: 'testFile', size: 1024 }, type: 'mender' }} onboardingState={{ complete: true }} updateCreation={jest.fn} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
