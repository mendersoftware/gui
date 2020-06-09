import React from 'react';
import renderer from 'react-test-renderer';
import DemoNotification from './demonotification';
import { undefineds } from '../../../../tests/mockData';

describe('DemoNotification Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DemoNotification />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
