import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import Devices from './devices';

it('renders correctly', () => {
  const context = {
    childContextTypes: {
      router: () => {}
    },
    context: {
      router: {
        route: {
          location: {
            hash: '',
            pathname: '',
            search: '',
            state: ''
          },
          match: { params: {}, isExact: false, path: '', url: '' }
        }
      }
    }
  };
  const tree = createMount()(
    <MemoryRouter>
      <Devices />
    </MemoryRouter>,
    context
  );
  expect(tree.html()).toMatchSnapshot();
});
