import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../../tests/mockData';
import CancelRequestDialog from './cancelrequest';

describe('CancelRequestDialog Component', () => {
  beforeEach(() => {
    Math.random = jest.fn(() => 0);
  });
  it('renders correctly', async () => {
    const { baseElement } = render(<CancelRequestDialog />);
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitMock = jest.fn();
    render(<CancelRequestDialog onCancel={jest.fn} onSubmit={submitMock} />);
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
    userEvent.click(screen.getByRole('radio', { name: /My project is delayed/i }));
    expect(screen.getByRole('button', { name: /Continue/i })).not.toBeDisabled();
    userEvent.click(screen.getByRole('radio', { name: /other/i }));
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/reason/i), 'test reason');
    expect(screen.getByRole('button', { name: /Continue/i })).not.toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/suggestions/i), 'test suggestion');
    userEvent.click(screen.getByRole('button', { name: /Continue/i }));

    expect(screen.queryByText(/thank you/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    expect(submitMock).toHaveBeenCalledWith(`test reason\ntest suggestion`);
  });
});
