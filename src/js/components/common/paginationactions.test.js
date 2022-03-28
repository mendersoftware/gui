import React from 'react';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/setupTests';
import { TablePaginationActions } from './pagination';

describe('TablePaginationActions Component', () => {
  it('paginates properly', async () => {
    jest.useFakeTimers();
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={0} onPageChange={changeListener} />);
    expect(screen.getByText('1-20 of 42')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[1]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalled();
    expect(screen.getByText('21-40 of 42')).toBeInTheDocument();
    jest.useRealTimers();
  });
  it('paginates properly backwards', async () => {
    jest.useFakeTimers();
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={1} onPageChange={changeListener} />);
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[0]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalled();
    jest.useRealTimers();
  });
  it('prevents going too far', async () => {
    const changeListener = jest.fn();
    render(<TablePaginationActions count={42} page={2} onPageChange={changeListener} />);
    expect(screen.getByText('41-42 of 42')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
  });
  it('prevents exceeding the pagination limit', async () => {
    jest.useFakeTimers();
    const changeListener = jest.fn();
    render(<TablePaginationActions count={2000000} page={498} onPageChange={changeListener} />);
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[1]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalled();
    expect(screen.getByText('9981-10000 of 2000000')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
    jest.useRealTimers();
  });
});
