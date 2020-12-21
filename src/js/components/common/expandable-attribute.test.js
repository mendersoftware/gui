import React from 'react';
import renderer from 'react-test-renderer';
import ExpandableAttribute from './expandable-attribute';
import { undefineds } from '../../../../tests/mockData';

describe('ExpandableAttribute Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<ExpandableAttribute />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
