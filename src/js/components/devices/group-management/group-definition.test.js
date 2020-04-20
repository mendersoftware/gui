import React from 'react';
import renderer from 'react-test-renderer';
import GroupDefinition from './group-definition';
import { undefineds } from '../../../../../tests/mockData';

describe('GroupDefinition Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<GroupDefinition groups={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
