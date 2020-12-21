import React from 'react';
import renderer from 'react-test-renderer';
import Loader from './loader';
import { undefineds } from '../../../../tests/mockData';

describe('Loader Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<Loader />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
