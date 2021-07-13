import React from 'react';
import { render } from '@testing-library/react';
import ArtifactPayload from './artifactPayload';
import { undefineds } from '../../../../tests/mockData';

describe('ArtifactPayload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ArtifactPayload payload={{ files: null, type_info: { type: 'test' } }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
