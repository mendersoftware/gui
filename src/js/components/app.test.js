import React from 'react';
import 'jsdom-worker';
import { act } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import App from './app';
import { defaultState, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';

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
      <Provider store={store}>
        <App />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
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
