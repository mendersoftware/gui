import React from 'react';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { render } from '../../../../../tests/setupTests';
import DeploymentOverview from './overview';

momentDurationFormatSetup(moment);

describe('DeploymentOverview Component', () => {
  it('renders correctly', async () => {
    const deployment = {
      name: 'test deployment',
      artifact_name: 'test',
      created: '2019-01-01',
      devices: {},
      finished: '2019-01-01',
      stats: {}
    };
    const creationMoment = moment();
    const elapsedMoment = moment();
    const duration = moment.duration(elapsedMoment.diff(creationMoment));
    const { baseElement } = render(
      <DeploymentOverview
        allDevices={[]}
        deployment={deployment}
        deviceCount={0}
        duration={duration}
        onAbortClick={jest.fn}
        onRetryClick={jest.fn}
        viewLog={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
  });
});
