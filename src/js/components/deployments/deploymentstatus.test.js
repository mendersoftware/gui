import React from 'react';
import { render } from '@testing-library/react';
import DeploymentStatus from './deploymentstatus';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentStatus Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentStatus refreshStatus={jest.fn()} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
