import React from 'react';
import renderer from 'react-test-renderer';
import GroupDefinition from './group-definition';

describe('GroupDefinition Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<GroupDefinition />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
