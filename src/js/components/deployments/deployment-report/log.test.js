import React from 'react';
import { render } from '@testing-library/react';
import DeploymentLog from './log';
import { undefineds } from '../../../../../tests/mockData';

describe('DeploymentLog Component', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<DeploymentLog onClose={jest.fn} logData="things" />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
