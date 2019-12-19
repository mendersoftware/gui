import React from 'react';
import renderer from 'react-test-renderer';
import Groups from './groups';

describe('Groups Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Groups groups={[]} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
