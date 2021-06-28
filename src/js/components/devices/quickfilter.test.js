import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickFilter from './quickfilter';
import { selectMaterialUiSelectOption } from '../../../../tests/setupTests';
import { undefineds } from '../../../../tests/mockData';

describe('QuickFilter Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<QuickFilter attributes={[{ key: 'id', value: 'thing' }]} onChange={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const changeMock = jest.fn();
    const ui = <QuickFilter attributes={[{ key: 'id', value: 'thing' }]} onChange={changeMock} />;
    const { rerender } = render(ui);
    await waitFor(() => rerender(ui));
    const element = screen.getByText('thing');
    await selectMaterialUiSelectOption(element, 'thing');
    act(() => userEvent.paste(screen.queryByPlaceholderText(/Filter/i), 'something'));
    jest.runAllTimers();
    await waitFor(() => rerender(ui));
    expect(changeMock).toHaveBeenCalledWith('something', 'id');
  });
});
