import React from 'react';
import renderer from 'react-test-renderer';
import EnterpriseNotification from './enterpriseNotification';

describe('EnterpriseNotification Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<EnterpriseNotification benefit="have a test benefit" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
