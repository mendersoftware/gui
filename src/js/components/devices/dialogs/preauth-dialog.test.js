import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
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
    act(() => userEvent.upload(uploadInput, menderFile));
    await waitFor(() => rerender(ui));

    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => expect(document.querySelector(dropzone)).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('test.pem')).toBeInTheDocument();
    const fabSelector = '.MuiFab-root';
    expect(document.querySelector(fabSelector)).toBeDisabled();
    act(() => userEvent.paste(screen.getByPlaceholderText(/key/i), 'testKey'));
    act(() => userEvent.paste(screen.getByPlaceholderText(/value/i), 'testValue'));
    expect(document.querySelector(fabSelector)).not.toBeDisabled();
    act(() => userEvent.click(document.querySelector(fabSelector)));
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.queryByText(errorText)).not.toBeInTheDocument());
    act(() => userEvent.click(screen.getByRole('button', { name: 'Save' })));
    await waitFor(() => expect(screen.queryAllByText(errorText)).toBeTruthy());
    uploadMock.mockClear();
    act(() => userEvent.type(screen.getByDisplayValue('testValue'), 'testValues'));
    await waitFor(() => expect(screen.queryByText(errorText)).not.toBeInTheDocument());
    uploadMock.mockResolvedValue(true);
    act(() => userEvent.click(screen.getByRole('button', { name: 'Save and add another' })));
    await waitFor(() => rerender(ui));
    expect(uploadMock).toHaveBeenCalled();
  });

  it('prevents preauthorizations when device limit was reached', async () => {
    const menderFile = new File(['testContent plain'], 'test.pem');
    const ui = <PreauthDialog acceptedDevices={100} deviceLimit={2} limitMaxed={true} />;
    const { rerender } = render(ui);
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector(dropzone);
    act(() => userEvent.upload(uploadInput, menderFile));
    await waitFor(() => rerender(ui));
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/You have reached your limit/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
