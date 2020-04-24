import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import DeploymentOverview from './overview';

let dateMock;
momentDurationFormatSetup(moment);

describe('DeploymentOverview Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
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
