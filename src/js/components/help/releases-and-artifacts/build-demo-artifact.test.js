import React from 'react';
import { render } from '@testing-library/react';
import BuildDemoArtifact from './build-demo-artifact';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('BuildDemoArtifact Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<BuildDemoArtifact {...helpProps} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
