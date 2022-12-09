import React from 'react';
import { Provider } from 'react-redux';

import { act } from '@testing-library/react';
import 'jsdom-worker';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';
import App from './app';

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
    window.localStorage.getItem.mockReturnValueOnce('false');
    const { baseElement } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    window.localStorage.getItem.mockReturnValueOnce('false');
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'JWT=omnomnom'
    });
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    await act(async () => jest.advanceTimersByTime(900500));
  });
});
