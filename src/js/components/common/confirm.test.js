import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Confirm from './confirm';

describe('Confirm Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<Confirm type="abort" />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const actionCheck = jest.fn();
    const cancelCheck = jest.fn();

    const { container } = render(<Confirm type="chartRemoval" action={actionCheck} cancel={cancelCheck} />);

    expect(screen.queryByText(/remove this chart\?/i)).toBeInTheDocument();
    userEvent.click(container.querySelector('.green'));
    expect(actionCheck).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/removing/i)).toBeInTheDocument();
    userEvent.click(container.querySelector('.red'));
    expect(cancelCheck).toHaveBeenCalledTimes(1);
  });
});
