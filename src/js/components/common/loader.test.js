import React from 'react';
import renderer from 'react-test-renderer';
import Loader from './loader';

describe('Loader Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Loader />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
