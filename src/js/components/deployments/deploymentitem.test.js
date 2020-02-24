import React from 'react';
import renderer from 'react-test-renderer';
import DeploymentItem from './deploymentitem';

describe('DeploymentItem Component', () => {
  it('renders correctly', () => {
    const columnHeaders = [
      { title: 'Release', class: '' },
      { title: 'Device group', class: '' },
      { title: 'Start time', class: '' },
      { title: 'Total # devices', class: 'align-right' },
      { title: 'Overall progress', class: '' },
      { title: '', class: '' },
      { title: '', class: '' }
    ];
    const tree = renderer.create(<DeploymentItem columnHeaders={columnHeaders} deployment={{ stats: [] }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
