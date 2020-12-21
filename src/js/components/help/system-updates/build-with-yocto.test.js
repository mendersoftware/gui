import React from 'react';
import renderer from 'react-test-renderer';
import BuildYocto from './build-with-yocto';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('BuildYocto Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<BuildYocto {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
