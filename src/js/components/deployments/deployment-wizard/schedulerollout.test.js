import React from 'react';
import renderer from 'react-test-renderer';
import ScheduleRollout from './schedulerollout';
import { undefineds } from '../../../../../tests/mockData';

describe('ScheduleRollout Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ScheduleRollout previousRetries={0} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
