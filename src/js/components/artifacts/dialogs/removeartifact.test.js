import React from 'react';
import { render } from '@testing-library/react';
import RemoveArtifact from './removeartifact';
import { undefineds } from '../../../../../tests/mockData';

describe('RemoveArtifact Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<RemoveArtifact open={true} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
