import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import Distribution from './distribution';

describe('PendingDevices Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<Distribution attribute="artifact_name" group="test" devices={{}} groups={{}} />);
    expect(tree.html()).toMatchSnapshot();
  });
});
