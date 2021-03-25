import React from 'react';
import renderer from 'react-test-renderer';
import AuthsetList from './authsetlist';
import { undefineds } from '../../../../../../tests/mockData';

describe('AuthsetList Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<AuthsetList device={{ auth_sets: [] }} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
