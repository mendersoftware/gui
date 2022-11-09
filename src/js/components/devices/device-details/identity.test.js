import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import DeviceIdentity from './identity';

const mockStore = configureStore([thunk]);

describe('DeviceIdentity Component', () => {
  it('renders correctly', async () => {
    const store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceIdentity device={defaultState.devices.byId.a1} setSnackbar={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
  it('renders correctly without a mac', async () => {
    const store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceIdentity device={defaultState.devices.byId.c1} setSnackbar={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
