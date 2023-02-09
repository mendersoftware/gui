import React from 'react';

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../../tests/setupTests';
import ChartAdditionWidget from './chart-addition';

const software = [
  { title: 'something', value: 'something1', nestingLevel: 1 },
  { subheader: 'somethingSub', value: 'something2', nestingLevel: 1 },
  { title: 'subSomething', value: 'something3', nestingLevel: 2 }
];

describe('ChartAdditionWidget Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ChartAdditionWidget groups={defaultState.devices.groups.byId} software={software} />);
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const submitCheck = jest.fn();
    render(<ChartAdditionWidget groups={defaultState.devices.groups.byId} onAdditionClick={submitCheck} software={software} />);
    expect(screen.queryByText(/Device group/i)).not.toBeInTheDocument();
    act(() => userEvent.click(screen.getByText(/Add a widget/i)));
    const element = screen.getByLabelText(/Device group/i);
    await selectMaterialUiSelectOption(element, 'testGroup');
    act(() => userEvent.click(screen.getByRole('button', { name: /Save/i })));
    expect(submitCheck).toHaveBeenCalled();
    expect(screen.queryByText(/Device group/i)).not.toBeInTheDocument();
  });
});
