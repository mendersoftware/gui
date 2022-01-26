import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentNotifications from './deploymentnotifications';

describe('DeploymentNotifications Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<DeploymentNotifications />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
