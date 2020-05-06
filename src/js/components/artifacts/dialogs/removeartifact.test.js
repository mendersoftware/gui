import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import RemoveArtifact from './removeartifact';
import { undefineds } from '../../../../../tests/mockData';

describe('RemoveArtifact Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<RemoveArtifact open={true} />).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
