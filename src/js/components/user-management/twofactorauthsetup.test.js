import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import TwoFactorAuthSetup from './twofactorauthsetup';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('TwoFactorAuthSetup Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      users: {
        globalSettings: { previousPhases: [] },
        qrCode: null
      }
    });
  });
  it('renders correctly', () => {
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
