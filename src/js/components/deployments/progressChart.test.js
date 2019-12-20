import React from 'react';
import renderer from 'react-test-renderer';
import ProgressChart from './progressChart';

describe('ProgressChart Component', () => {
  it('renders correctly', () => {
    const created = new Date('2019-01-01');
    const tree = renderer.create(<ProgressChart deployment={{ created }} device={{ status: 'installing' }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
