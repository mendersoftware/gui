import React from 'react';
import renderer from 'react-test-renderer';
import DebPackage from './mender-deb-package';

describe('DebPackage Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DebPackage findLocalIpAddress={jest.fn()} debPackageVersion="master" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
