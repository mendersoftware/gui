import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authsets from './authsets';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Authsets Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {
          a1: {
            auth_sets: []
          }
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Authsets device={{ id: 'a1' }} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
