import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Progress from './inprogressdeployments';

const mockStore = configureStore([thunk]);
let dateMock;

describe('InProgressDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        hostedAnnouncement: null,
        features: { isEnterprise: false, isHosted: false },
        docsVersion: null
      },
      deployments: {
        byId: {
          d1: {
            id: 'd1',
            name: 'test deployment',
            artifact_name: 'test',
            artifacts: ['123'],
            created: '2019-01-01T12:30:00.000Z',
            device_count: 1,
            devices: {
              a1: {}
            },
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
          },
          d2: {
            id: 'd2',
            name: 'test deployment 2',
            artifact_name: 'test',
            artifacts: ['123'],
            created: '2019-01-01T12:30:00.000Z',
            device_count: 1,
            devices: {
              b1: {}
            },
            stats: {
              downloading: 0,
              decommissioned: 0,
              failure: 0,
              installing: 0,
              noartifact: 0,
              pending: 1,
              rebooting: 0,
              success: 0,
              'already-installed': 0
            }
          }
        },
        byStatus: {
          finished: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          inprogress: { deploymentIds: ['d1'], selectedDeploymentIds: ['d1'], total: 1 },
          pending: { deploymentIds: ['d2'], selectedDeploymentIds: ['d2'], total: 1 }
        },
        selectedDeployment: null
      },
      devices: {
        byId: {
          a1: {
            auth_sets: []
          },
          b1: {
            auth_sets: []
          }
        },
        byStatus: {
          accepted: {
            deviceIds: ['a1'],
            total: 0
          },
          pending: {
            deviceIds: ['b1'],
            total: 0
          }
        },
        groups: { byId: {} },
        limit: 500
      },
      users: {
        byId: { a1: { email: 'a@b.com', id: 'a1' } },
        currentUser: 'a1',
        globalSettings: {},
        onboarding: { complete: false },
        showHelptips: true
      }
    });

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
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Progress />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
