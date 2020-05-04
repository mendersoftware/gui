import React from 'react';
import renderer from 'react-test-renderer';
import LeftNav from './left-nav';
import { undefineds } from '../../../../tests/mockData';

describe('LeftNav Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<LeftNav />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
