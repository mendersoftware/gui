import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentStatus from './deploymentstatus';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentStatus Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeploymentStatus refreshStatus={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
