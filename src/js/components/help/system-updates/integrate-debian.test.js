import React from 'react';
import renderer from 'react-test-renderer';
import IntegrateDebian from './integrate-debian';
import { helpProps } from '../mockData';

describe('IntegrateDebian Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<IntegrateDebian {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
