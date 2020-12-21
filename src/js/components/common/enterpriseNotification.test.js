import React from 'react';
import renderer from 'react-test-renderer';
import EnterpriseNotification from './enterpriseNotification';
import { undefineds } from '../../../../tests/mockData';

describe('EnterpriseNotification Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<EnterpriseNotification benefit="a test benefit" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
