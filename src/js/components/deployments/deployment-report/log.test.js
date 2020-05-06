import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DeploymentLog from './log';

describe('DeploymentLog Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<DeploymentLog onClose={jest.fn} logData={'things'} />).html();
    expect(tree).toMatchSnapshot();
  });
});
