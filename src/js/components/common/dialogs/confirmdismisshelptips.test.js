import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ConfirmDismissHelptips from './confirmdismisshelptips';
import { undefineds } from '../../../../../tests/mockData';

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
