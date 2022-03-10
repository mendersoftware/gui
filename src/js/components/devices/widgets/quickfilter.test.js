import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickFilter from './quickfilter';
import { undefineds } from '../../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../../tests/setupTests';

describe('QuickFilter Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<QuickFilter attributes={[{ key: 'name', value: 'thing' }]} filters={[]} onChange={jest.fn} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const changeMock = jest.fn();
    const ui = <QuickFilter attributes={[{ key: 'name', value: 'thing', scope: 'test' }]} filters={[]} onChange={changeMock} />;
    const { rerender } = render(ui);
    await waitFor(() => rerender(ui));
    const element = screen.getByText('thing');
    await selectMaterialUiSelectOption(element, 'thing');
    act(() => userEvent.paste(screen.queryByPlaceholderText(/Filter/i), 'something'));
    jest.runAllTimers();
    await waitFor(() => rerender(ui));
    expect(changeMock).toHaveBeenCalledWith('something', 'name', 'test');
  });
});
