import React from 'react';
import renderer from 'react-test-renderer';
import ExpandableAttribute from './expandable-attribute';

describe('ExpandableAttribute Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<ExpandableAttribute />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
