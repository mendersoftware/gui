import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);
let dateMock;

describe('DeploymentReport Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: {
          isEnterprise: false
        }
      },
      devices: {
        byStatus: {
          accepted: { total: 0 }
        }
      },
      deployments: {
        byId: {
          a1: {
            artifact_name: 'test',
            created: '2019-01-01',
            devices: {},
            finished: '2019-01-01',
            stats: {}
          }
        },
        selectedDeployment: 'a1'
      },
      releases: {
        byId: {
          a1: {
            Name: 'a1',
            device_types_compatible: []
          }
        }
      },
      users: {
        organization: {
          plan: 'os'
        }
      }
    });
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
    const tree = createMount()(
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport deployment={{ id: 'a1' }} type="finished" />
        </Provider>
      </MemoryRouter>
    ).html();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
