import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ConfirmDismissHelptips from './confirmdismisshelptips';

const mockStore = configureStore([thunk]);
const store = mockStore({});

it('renders correctly', () => {
  const tree = createMount()(
    <Provider store={store}>
      <ConfirmDismissHelptips open={true} />
    </Provider>
  );
  expect(tree.html()).toMatchSnapshot();
});
