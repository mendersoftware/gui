import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ConfirmDismissHelptips from './confirmdismisshelptips';

it('renders correctly', () => {
  const tree = createMount()(<ConfirmDismissHelptips open={true} />);
  expect(tree.html()).toMatchSnapshot();
});
