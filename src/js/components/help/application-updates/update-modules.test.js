import React from 'react';
import renderer from 'react-test-renderer';
import UpdateModules from './update-modules';
import { helpProps } from '../mockData';

describe('UpdateModules Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UpdateModules {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
