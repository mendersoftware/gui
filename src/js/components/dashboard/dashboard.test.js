import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import Dashboard from './dashboard';

it('renders without crashing', () => {
  mount(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
});

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
