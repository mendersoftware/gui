import React from 'react';
import renderer from 'react-test-renderer';
import ProgressChart from './progressChart';
import { undefineds } from '../../../../tests/mockData';

describe('ProgressChart Component', () => {
  it('renders correctly', async () => {
    const created = new Date('2019-01-01');
    const tree = renderer
      .create(
        <ProgressChart created={created} currentProgressCount={0} id={1} totalDeviceCount={0} totalFailureCount={0} totalSuccessCount={0} phases={null} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
