import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigImportDialog from './configimportdialog';
import { undefineds } from '../../../../../tests/mockData';

describe('ConfigImportDialog Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ConfigImportDialog onSubmit={jest.fn} onCancel={jest.fn} setSnackbar={jest.fn} />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitMock = jest.fn();
    const menderFile = new File(['testContent plain'], 'test.pem');

    const ui = <ConfigImportDialog onSubmit={submitMock} onCancel={jest.fn} setSnackbar={jest.fn} />;
    const { rerender } = render(ui);
    expect(screen.getByText(/the current default/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/the current default/i));
    userEvent.click(screen.getByRole('button', { name: /import/i }));
    expect(submitMock).toHaveBeenCalledWith({ importType: 'default', config: null });

    // container.querySelector doesn't work in this scenario for some reason -> but querying document seems to work
    const uploadInput = document.querySelector('.dropzone input');
    act(() => userEvent.upload(uploadInput, menderFile));
    await waitFor(() => rerender(ui));
    expect(uploadInput.files).toHaveLength(1);
  });
});
