import React from 'react';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { defaultHeaders as columnHeaders } from './deploymentslist';
import DeploymentItem from './deploymentitem';

describe('DeploymentItem Component', () => {
  it('renders correctly', async () => {
    const deployment = {
      id: 'd1',
      name: 'test deployment',
      artifact_name: 'test',
      created: '2019-01-01T13:30:00.000Z',
      artifacts: ['123'],
      device_count: 1,
      stats: {
        downloading: 0,
        decommissioned: 0,
        failure: 0,
        installing: 1,
        noartifact: 0,
        pending: 0,
        rebooting: 0,
        success: 0,
        'already-installed': 0
      }
    };
    const { container } = render(<DeploymentItem columnHeaders={columnHeaders} deployment={deployment} type="progress" />);
    expect(container.firstChild.firstChild).toMatchSnapshot();
    expect(container).toEqual(expect.not.stringMatching(undefineds));
  });
});
