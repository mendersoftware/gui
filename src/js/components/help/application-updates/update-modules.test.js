import React from 'react';
import renderer from 'react-test-renderer';
import UpdateModules from './update-modules';

describe('UpdateModules Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<UpdateModules />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
