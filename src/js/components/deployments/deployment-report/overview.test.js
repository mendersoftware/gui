import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
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
    const tree = renderer
      .create(
        <MemoryRouter>
          <DeploymentOverview
            allDevices={[]}
            deployment={deployment}
            deviceCount={0}
            duration={duration}
            onAbortClick={jest.fn}
            onRetryClick={jest.fn}
            viewLog={jest.fn}
          />
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
