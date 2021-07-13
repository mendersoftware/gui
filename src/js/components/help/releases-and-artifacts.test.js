import React from 'react';
import { render } from '@testing-library/react';
import ReleasesArtifacts from './releases-and-artifacts';
import { helpProps } from './mockData';
import { undefineds } from '../../../../tests/mockData';

describe('ReleasesArtifacts Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ReleasesArtifacts {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
