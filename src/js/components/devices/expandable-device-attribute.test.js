import React from 'react';
import renderer from 'react-test-renderer';
import ExpandableDeviceAttribute from './expandable-device-attribute';

describe('ExpandableDeviceAttribute Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ExpandableDeviceAttribute />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
