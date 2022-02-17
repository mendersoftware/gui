import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ConfirmDismissHelptips from './confirmdismisshelptips';

const mockStore = configureStore([thunk]);

describe('ConfirmDismissHelptips Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ConfirmDismissHelptips open={true} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
