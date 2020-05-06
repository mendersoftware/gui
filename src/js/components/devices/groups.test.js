import React from 'react';
import renderer from 'react-test-renderer';
import Groups from './groups';
import { undefineds } from '../../../../tests/mockData';

describe('Groups Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Groups groups={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
