import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockDate, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import TimerangePicker from './timerange-picker';

const realDate = Date;

describe('TimerangePicker Component', () => {
  beforeEach(() => {
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          // eslint-disable-next-line constructor-super
          return super(date);
        }
        // eslint-disable-next-line constructor-super
        return super(mockDate.getTime());
      }
    };
  });

  afterEach(() => {
    global.Date = realDate;
  });

  it('renders correctly', async () => {
    const { baseElement } = render(<TimerangePicker />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const changeListener = jest.fn();
    render(<TimerangePicker onChange={changeListener} />);
    await user.click(screen.getByText(/last 7 days/i));
    expect(changeListener).toHaveBeenCalledWith('2019-01-07T00:00:00.000Z', '2019-01-13T23:59:59.999Z');
    await user.click(screen.getByText(/yesterday/i));
    expect(changeListener).toHaveBeenCalledWith('2019-01-12T00:00:00.000Z', '2019-01-12T23:59:59.999Z');
  });
});
