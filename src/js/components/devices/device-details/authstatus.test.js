import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AuthStatus from './authstatus';
import { defaultState, undefineds } from '../../../../../tests/mockData';
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
          toggleAuthsets={jest.fn}
        />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
