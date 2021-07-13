import React from 'react';
import { render } from '@testing-library/react';
import ScheduleRollout from './schedulerollout';
import { undefineds } from '../../../../../tests/mockData';

describe('ScheduleRollout Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(<ScheduleRollout previousRetries={0} />);
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
