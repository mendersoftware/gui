import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SharedSnackbar from './sharedsnackbar';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('SharedSnackbar Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        snackbar: {}
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <SharedSnackbar snackbar={{ maxWidth: 200 }} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
