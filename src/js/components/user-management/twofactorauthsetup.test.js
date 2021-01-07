import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import TwoFactorAuthSetup from './twofactorauthsetup';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('TwoFactorAuthSetup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <TwoFactorAuthSetup />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
