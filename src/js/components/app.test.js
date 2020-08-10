import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import App from './app';
import { defaultState, undefineds } from '../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('App Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {},
        byStatus: {
          ...defaultState.deployments.byStatus,
          inprogress: {
            ...defaultState.deployments.byStatus.inprogress,
            total: 0
          }
        },
        deploymentDeviceLimit: null
      },
      users: {
        ...defaultState.users,
        currentUser: null
      }
    });
  });

  it('renders correctly', () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'JWT=omnomnom'
    });
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <App />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
