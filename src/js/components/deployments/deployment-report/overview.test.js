import React from 'react';

import { render } from '../../../../../tests/setupTests';
import DeploymentOverview from './overview';

describe('DeploymentOverview Component', () => {
  it('renders correctly', async () => {
    const deployment = {
      name: 'test deployment',
      artifact_name: 'test',
      created: '2019-01-01',
      devices: { a: { id: '13' } },
      finished: '2019-01-01',
      group: 'testGroup',
      stats: {}
    };
    const { baseElement } = render(<DeploymentOverview devicesById={{}} deployment={deployment} tenantCapabilities={{ hasFullFiltering: true }} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
  });
});
