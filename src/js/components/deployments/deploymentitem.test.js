import React from 'react';
import DeploymentItem from './deploymentitem';
import { render } from '@testing-library/react';
import { defaultHeaders as columnHeaders } from './deploymentslist';
import { undefineds } from '../../../../tests/mockData';

let dateMock;

describe('DeploymentItem Component', () => {
  beforeEach(() => {
    const mockDate = new Date('2019-01-01T13:00:00.000Z');
    const _Date = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    global.Date.toISOString = _Date.toISOString;
    global.Date.UTC = _Date.UTC;
    dateMock = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    dateMock.mockRestore();
  });

  it('renders correctly', () => {
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
