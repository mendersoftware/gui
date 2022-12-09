import React from 'react';
import { Provider } from 'react-redux';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { DeviceNameInput } from './devicenameinput';

const mockStore = configureStore([thunk]);

describe('DeviceNameInput Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const { baseElement } = render(<DeviceNameInput device={defaultState.devices.byId.a1} isHovered setSnackbar={jest.fn} setDeviceTags={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitCheck = jest.fn();
    submitCheck.mockResolvedValue();
    const snackCheck = jest.fn();
    const ui = (
      <Provider store={store}>
        <DeviceNameInput
          device={{ ...defaultState.devices.byId.a1, tags: { name: 'testname' } }}
          isHovered
          setSnackbar={snackCheck}
          setDeviceTags={submitCheck}
        />
      </Provider>
    );
    const { rerender } = render(ui);
    expect(screen.queryByDisplayValue(/testname/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button'));
    await waitFor(() => rerender(ui));
    userEvent.type(screen.getByDisplayValue(/testname/i), 'something');
    await act(async () => await userEvent.click(screen.getAllByRole('button')[0]));
    expect(submitCheck).toHaveBeenCalledWith(defaultState.devices.byId.a1.id, { name: 'testnamesomething' });
    expect(snackCheck).toHaveBeenCalled();
  });
});
