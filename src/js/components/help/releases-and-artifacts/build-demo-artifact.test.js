import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import BuildDemoArtifact from './build-demo-artifact';
import { helpProps } from '../mockData';

describe('BuildDemoArtifact Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<BuildDemoArtifact {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
