import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import ArtifactPayload from './artifactPayload';

describe('ArtifactPayload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactPayload payload={{ files: null, type_info: { type: 'test' } }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
