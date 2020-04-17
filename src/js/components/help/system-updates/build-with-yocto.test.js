import React from 'react';
import renderer from 'react-test-renderer';
import BuildYocto from './build-with-yocto';
import { helpProps } from '../mockData';

describe('BuildYocto Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<BuildYocto {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
