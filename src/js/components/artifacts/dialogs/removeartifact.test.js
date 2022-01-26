import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RemoveArtifact from './removeartifact';

describe('RemoveArtifact Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<RemoveArtifact open={true} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
