import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceConnectionDialog from './deviceconnectiondialog';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';

const mockStore = configureStore([thunk]);

describe('DeviceConnectionDialog Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceConnectionDialog onCancel={jest.fn} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    render(
      <Provider store={store}>
        <DeviceConnectionDialog onCancel={jest.fn} />
      </Provider>
    );
    userEvent.click(screen.getByText(/get started/i));
    expect(screen.getByText(/Enter your device type/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /back/i }));
    userEvent.click(screen.getByText(/Try a virtual device/i));
    expect(screen.getByText(/run the following command to start the virtual device/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Waiting for device/i })).toBeInTheDocument();
  });
});
