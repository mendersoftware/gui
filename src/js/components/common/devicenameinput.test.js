// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { Provider } from 'react-redux';

import { screen, waitFor } from '@testing-library/react';
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    await user.click(screen.getByRole('button'));
    await waitFor(() => rerender(ui));
    await user.type(screen.getByDisplayValue(/testname/i), 'something');
    await user.click(screen.getAllByRole('button')[0]);
    expect(submitCheck).toHaveBeenCalledWith(defaultState.devices.byId.a1.id, { name: 'testnamesomething' });
    expect(snackCheck).toHaveBeenCalled();
  });
});
