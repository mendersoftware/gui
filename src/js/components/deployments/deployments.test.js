import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import Deployments from './deployments';

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
      <Deployments location={{ search: '' }} />
    </MemoryRouter>,
    context
  );
  expect(tree.html()).toMatchSnapshot();
});
