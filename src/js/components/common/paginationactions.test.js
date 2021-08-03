import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TablePaginationActions } from './pagination';

describe('Loader Component', () => {
  it('works as expected', async () => {
    jest.useFakeTimers();
    const changeListener = jest.fn();
    const ui = <TablePaginationActions count={42} page={0} onChangePage={changeListener} />;
    const { rerender } = render(ui);
    expect(screen.getByDisplayValue(1)).toBeInTheDocument();
    expect(screen.getByText('/ 3')).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0]).toBeDisabled();
    expect(screen.getAllByRole('button')[1]).toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[2]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(screen.getByDisplayValue(2)).toBeInTheDocument();
    rerender(<TablePaginationActions count={42} page={1} onChangePage={changeListener} />);
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled();
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled();
    expect(screen.getAllByRole('button')[2]).not.toBeDisabled();
    expect(screen.getAllByRole('button')[3]).not.toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[3]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalledTimes(2);
    rerender(<TablePaginationActions count={42} page={2} onChangePage={changeListener} />);
    expect(screen.getByDisplayValue(3)).toBeInTheDocument();
    expect(screen.getAllByRole('button')[2]).toBeDisabled();
    expect(screen.getAllByRole('button')[3]).toBeDisabled();
    await act(async () => {
      userEvent.click(screen.getAllByRole('button')[0]);
      jest.advanceTimersByTime(400);
    });
    expect(changeListener).toHaveBeenCalledTimes(3);
    rerender(<TablePaginationActions count={42} page={0} onChangePage={changeListener} />);
    expect(screen.getByDisplayValue(1)).toBeInTheDocument();
    const input = screen.getByDisplayValue(1);
    fireEvent.change(input, { target: { value: 76 } });
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(screen.queryByDisplayValue(76)).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(3)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: -76 } });
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(screen.getByDisplayValue(1)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
