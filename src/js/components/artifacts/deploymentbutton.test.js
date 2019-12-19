import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentButton from './deploymentbutton';

describe('DeploymentButton Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<DeploymentButton />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
