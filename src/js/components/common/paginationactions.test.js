import React from 'react';

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/setupTests';
import { TablePaginationActions } from './pagination';

describe('TablePaginationActions Component', () => {
  it('paginates properly', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={0} onPageChange={changeListener} />);
    expect(screen.getByText('1-20 of 42')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
    await user.click(screen.getAllByRole('button')[1]);
    act(() => jest.advanceTimersByTime(400));
    expect(changeListener).toHaveBeenCalled();
    expect(screen.getByText('21-40 of 42')).toBeInTheDocument();
  });
  it('paginates properly backwards', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={1} onPageChange={changeListener} />);
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled();
    await user.click(screen.getAllByRole('button')[0]);
    act(() => jest.advanceTimersByTime(400));
    expect(changeListener).toHaveBeenCalled();
  });
  it('prevents going too far', async () => {
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={2} onPageChange={changeListener} />);
    expect(screen.getByText('41-42 of 42')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
  });
  it('prevents exceeding the pagination limit', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const changeListener = jest.fn();
    render(<TablePaginationActions count={2000000} page={498} onPageChange={changeListener} />);
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled();
    await user.click(screen.getAllByRole('button')[1]);
    act(() => jest.advanceTimersByTime(400));
    expect(changeListener).toHaveBeenCalled();
    expect(screen.getByText('9981-10000 of 2000000')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
  });
});
