import React from 'react';
import renderer from 'react-test-renderer';
import IntegrateDebian from './integrate-debian';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('IntegrateDebian Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<IntegrateDebian {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
