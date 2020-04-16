import React from 'react';
import renderer from 'react-test-renderer';
import DebPackage from './mender-deb-package';

describe('DebPackage Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DebPackage findLocalIpAddress={jest.fn()} menderDebPackageVersion="master" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
