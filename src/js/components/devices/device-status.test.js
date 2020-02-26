import React from 'react';
import renderer from 'react-test-renderer';
import DeviceStatus from './device-status';

describe('DeviceStatus Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeviceStatus device={{ auth_sets: [{ status: 'pending' }] }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
