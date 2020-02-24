import React from 'react';
import renderer from 'react-test-renderer';
import PlanNotification from './plannotification';

describe('PlanNotification Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<PlanNotification />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
