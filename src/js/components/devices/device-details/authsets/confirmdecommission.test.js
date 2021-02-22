import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmDecommission from './confirmdecommission';
import { undefineds } from '../../../../tests/mockData';

describe('ConfirmDecommission Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<ConfirmDecommission />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
