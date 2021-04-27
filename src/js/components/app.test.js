import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
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
      app: {
        ...defaultState.app,
        trackerCode: 'testtracker'
      },
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

  it('renders correctly', async () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'JWT=omnomnom'
    });
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'JWT=omnomnom'
    });
    render(
      <MemoryRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>
    );
    jest.advanceTimersByTime(900500);
  });
});
