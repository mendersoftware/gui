import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import Devices from './devices';

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Devices />
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
