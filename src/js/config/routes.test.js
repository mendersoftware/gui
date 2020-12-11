import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { publicRoutes } from './routes';
import { defaultState } from '../../../tests/mockData';

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

  test('invalid path should redirect to Dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/random']}>
        <Provider store={store}>{publicRoutes}</Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });

  test('valid path should not redirect to 404', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>{publicRoutes}</Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByText('Log in')).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeFalsy();
  });
});
