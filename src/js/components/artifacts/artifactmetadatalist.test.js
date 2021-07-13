import React from 'react';
import { render } from '@testing-library/react';
import ArtifactMetadataList from './artifactmetadatalist';
import { undefineds } from '../../../../tests/mockData';

describe('ArtifactPayload Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <ArtifactMetadataList metaInfo={{ content: [{ key: 'custom-key', primary: 'primary text', secondary: 'secondary text' }], title: 'test' }} />
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
