import React from 'react';
import renderer from 'react-test-renderer';
import DeviceInventoryLoader from './deviceinventoryloader';
import { undefineds } from '../../../../../tests/mockData';

describe('CreateGroup Component', () => {
  it('renders correctly', async () => {
    const tree = renderer.create(<DeviceInventoryLoader />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
