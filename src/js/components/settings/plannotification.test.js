import React from 'react';
import renderer from 'react-test-renderer';
import PlanNotification from './plannotification';
import { undefineds } from '../../../../tests/mockData';

describe('PlanNotification Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<PlanNotification />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
