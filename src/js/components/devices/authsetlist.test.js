import React from 'react';
import renderer from 'react-test-renderer';
import AuthsetList from './authsetlist';
import { undefineds } from '../../../../tests/mockData';

describe('AuthsetList Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AuthsetList authsets={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
