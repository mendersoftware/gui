import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentItem from './deploymentitem';
import { defaultHeaders as columnHeaders } from './deploymentslist';

describe('DeploymentItem Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeploymentItem columnHeaders={columnHeaders} deployment={{ stats: {} }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
