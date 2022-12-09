import React from 'react';
import { Provider } from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import AuthStatus from './authstatus';

const mockStore = configureStore([thunk]);

describe('AuthStatus Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <AuthStatus
          device={{
            ...defaultState.devices.byId.a1,

            auth_sets: [
              ...defaultState.devices.byId.a1.auth_sets,
              {
                ...defaultState.devices.byId.a1.auth_sets[0],
                status: 'pending'
              }
            ]
          }}
          userCapabilities={adminUserCapabilities}
        />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
