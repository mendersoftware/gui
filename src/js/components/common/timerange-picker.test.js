// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
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
