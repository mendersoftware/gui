import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { publicRoutes } from './routes';
import Login from '../components/user-management/login';
import Settings from '../components/settings/settings';
import { defaultState } from '../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Router', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  test('invalid path should redirect to Dashboard', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/random']}>
        <Provider store={store}>{publicRoutes}</Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(Settings)).toHaveLength(0);
    expect(wrapper.find(Login)).toHaveLength(1);
  });

  test('valid path should not redirect to 404', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>{publicRoutes}</Provider>
      </MemoryRouter>
    );
    expect(wrapper.find(Settings)).toHaveLength(0);
    expect(wrapper.find(Login)).toHaveLength(1);
  });
});
