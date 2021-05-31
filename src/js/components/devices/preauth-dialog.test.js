import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreauthDialog from './preauth-dialog';
import { undefineds } from '../../../../tests/mockData';

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
    const uploadInput = document.querySelector('.dropzone input');
    userEvent.upload(uploadInput, menderFile);
    await act(() => waitFor(() => rerender(ui)));

    expect(uploadInput.files).toHaveLength(1);
    await waitFor(() => expect(document.querySelector('.dropzone input')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('test.pem')).toBeInTheDocument();
    expect(document.querySelector('.MuiFab-root')).toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(document.querySelector('.MuiFab-root')).not.toBeDisabled();
    userEvent.click(document.querySelector('.MuiFab-root'));

    uploadMock.mockRejectedValueOnce('test-errortext');
    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryAllByText('test-errortext')).toBeTruthy());
    uploadMock.mockClear();

    userEvent.type(screen.getByDisplayValue('testValue'), 'testValues');
    await waitFor(() => expect(screen.queryByText('test-errortext')).not.toBeInTheDocument());
    uploadMock.mockResolvedValue(true);
    await act(() => userEvent.click(screen.getByRole('button', { name: 'Save and add another' })));
    await waitFor(() => rerender(ui));
    jest.advanceTimersByTime(150);
    jest.runAllTimers();
    jest.runAllTicks();
    expect(uploadMock).toHaveBeenCalled();
  });

  it('prevents preauthorizations when device limit was reached', async () => {
    const menderFile = new File(['testContent plain'], 'test.pem');
    const ui = <PreauthDialog deviceLimitWarning={<div>I should be rendered</div>} limitMaxed={true} />;
    const { rerender } = render(ui);
    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    userEvent.upload(uploadInput, menderFile);
    await act(() => waitFor(() => rerender(ui)));
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(screen.getByText(/I should be rendered/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await act(() => waitFor(() => rerender(ui)));
  });
});
