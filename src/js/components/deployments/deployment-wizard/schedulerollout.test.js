import React from 'react';

import { undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ScheduleRollout from './schedulerollout';

describe('ScheduleRollout Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ScheduleRollout previousRetries={0} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
