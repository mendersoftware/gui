import React from 'react';
import renderer from 'react-test-renderer';
import LeftNav from './left-nav';

describe('LeftNav Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<LeftNav />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
