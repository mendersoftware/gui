import React from 'react';
import renderer from 'react-test-renderer';
import AcceptedDevices from './accepteddevices';

describe('AcceptedDevices Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AcceptedDevices />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
