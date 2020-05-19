import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentsList from './deploymentslist';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentsList Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeploymentsList items={[]} refreshItems={() => {}} type="pending" title="pending" />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
