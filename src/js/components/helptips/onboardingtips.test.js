import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { DevicePendingTip, WelcomeSnackTip } from './onboardingtips';

const mockStore = configureStore([thunk]);
const store = mockStore({});

describe('DevicePendingTip', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <DevicePendingTip />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('WelcomeSnackTip', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <WelcomeSnackTip />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
