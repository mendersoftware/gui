import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import PendingDevices from './pendingdevices';

describe('PendingDevices Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <PendingDevices />
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
