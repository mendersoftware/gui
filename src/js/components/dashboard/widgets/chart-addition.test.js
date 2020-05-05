import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ChartAdditionWidget from './chart-addition';

describe('ChartAdditionWidget Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(<ChartAdditionWidget />);
    expect(tree.html()).toMatchSnapshot();
  });
});
