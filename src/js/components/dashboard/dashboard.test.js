import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { mount } from 'enzyme';
import Dashboard from './dashboard';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Dashboard Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byStatus: {
          accepted: { deviceIds: [], total: 0 },
          active: { total: 0 },
          inactive: { total: 0 },
          pending: { deviceIds: [], total: 0 }
        }
      },
      deployments: {
        byId: {},
        byStatus: {
          finished: { total: 0 },
          inprogress: { total: 0 },
          pending: { total: 0 }
        },
        deploymentDeviceLimit: 500
      },
      users: {
        byId: {},
        currentUser: null,
        showHelptips: true,
        onboarding: { complete: false, showTips: true }
      }
    });
  });

  it('renders without crashing', () => {
    mount(
      <MemoryRouter>
        <Provider store={store}>
          <Dashboard />
        </Provider>
      </MemoryRouter>
    );
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Dashboard />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
