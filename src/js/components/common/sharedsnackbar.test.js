import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import SharedSnackbar from './sharedsnackbar';

const mockStore = configureStore([thunk]);
const store = mockStore({
  app: {
    snackbar: {}
  }
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
});
