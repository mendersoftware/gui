import React from 'react';
import renderer from 'react-test-renderer';
import UpdateModules from './update-modules';
import { helpProps } from '../mockData';
import { undefineds } from '../../../../../tests/mockData';

describe('UpdateModules Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<UpdateModules {...helpProps} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
