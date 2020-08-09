import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import PasswordReset from './passwordreset';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PasswordReset Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <PasswordReset location={{ state: { from: '' } }} match={{ params: { secretHash: '' } }} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
