import React from 'react';
import renderer from 'react-test-renderer';
import AuthsetList from './authsetlist';

describe('AuthsetList Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<AuthsetList authsets={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
