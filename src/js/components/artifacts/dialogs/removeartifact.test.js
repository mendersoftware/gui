import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import RemoveArtifact from './removeartifact';

describe('RemoveArtifact Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<RemoveArtifact open={true} />).html();
    expect(tree).toMatchSnapshot();
  });
});
