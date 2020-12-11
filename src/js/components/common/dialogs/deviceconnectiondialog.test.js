import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceConnectionDialog from './deviceconnectiondialog';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeviceConnectionDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceConnectionDialog open={true} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
