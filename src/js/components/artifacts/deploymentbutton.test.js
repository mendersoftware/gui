import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentButton from './deploymentbutton';
import { undefineds } from '../../../../tests/mockData';

describe('DeploymentButton Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeploymentButton />).toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
