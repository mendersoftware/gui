// Copyright 2020 Northern.tech AS
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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import PreauthDialog from './preauth-dialog';

const errorText = 'test-errortext';
const dropzone = '.dropzone input';

describe('PreauthDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <PreauthDialog deviceLimitWarning={<div>I should not be rendered/ undefined</div>} limitMaxed={false} onSubmit={jest.fn} onCancel={jest.fn} />
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const uploadMock = jest.fn();
    const submitMock = jest.fn();
    const menderFile = new File(['testContent plain'], 'test.pem');
    uploadMock.mockRejectedValueOnce(errorText);

    const ui = (
      <PreauthDialog
        deviceLimitWarning={<div>I should not be rendered/ undefined</div>}
        limitMaxed={false}
        onSubmit={submitMock}
        onCancel={jest.fn}
        preauthDevice={uploadMock}
      />
    );
    const { rerender } = render(ui);
    expect(screen.getByText(/upload a public key file/i)).toBeInTheDocument();
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector(dropzone);
    await user.upload(uploadInput, menderFile);
    await waitFor(() => rerender(ui));

    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => expect(document.querySelector(dropzone)).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('test.pem')).toBeInTheDocument();
    const fabSelector = '.MuiFab-root';
    expect(document.querySelector(fabSelector)).toBeDisabled();
    await user.type(screen.getByPlaceholderText(/key/i), 'testKey');
    await user.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(document.querySelector(fabSelector)).not.toBeDisabled();
    await user.click(document.querySelector(fabSelector));
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.queryByText(errorText)).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryAllByText(errorText)).toBeTruthy());
    uploadMock.mockClear();
    await user.type(screen.getByDisplayValue('testValue'), 'testValues');
    await waitFor(() => expect(screen.queryByText(errorText)).not.toBeInTheDocument());
    uploadMock.mockResolvedValue(true);
    await user.click(screen.getByRole('button', { name: 'Save and add another' }));
    await waitFor(() => rerender(ui));
    expect(uploadMock).toHaveBeenCalled();
  });

  it('prevents preauthorizations when device limit was reached', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const menderFile = new File(['testContent plain'], 'test.pem');
    const ui = <PreauthDialog acceptedDevices={100} deviceLimit={2} limitMaxed={true} />;
    const { rerender } = render(ui);
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector(dropzone);
    await user.upload(uploadInput, menderFile);
    await waitFor(() => rerender(ui));
    await user.type(screen.getByPlaceholderText(/key/i), 'testKey');
    await user.type(screen.getByPlaceholderText(/value/i), 'testValue');
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/You have reached your limit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
