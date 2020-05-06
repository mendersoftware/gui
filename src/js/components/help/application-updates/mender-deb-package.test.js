import React from 'react';
import renderer from 'react-test-renderer';
import DebPackage from './mender-deb-package';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('DebPackage Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DebPackage {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
