import React from 'react';
import renderer from 'react-test-renderer';
import DeviceStatus from './device-status';
import { undefineds } from '../../../../tests/mockData';

describe('DeviceStatus Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<DeviceStatus device={{ auth_sets: [{ status: 'pending' }] }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
