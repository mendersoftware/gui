import React from 'react';
import renderer from 'react-test-renderer';
import BuildYocto from './build-with-yocto';

describe('BuildYocto Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BuildYocto />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
