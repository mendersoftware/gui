import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import { PublicRoutes } from './routes';

const mockStore = configureStore([thunk]);

describe('Router', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.features,
          isHosted: true
        }
      }
    });
  });

  test('invalid path should redirect to Dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/random']}>
        <Provider store={store}>
          <PublicRoutes />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });

  test('valid path should not redirect to 404', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>
          <PublicRoutes />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });
});
