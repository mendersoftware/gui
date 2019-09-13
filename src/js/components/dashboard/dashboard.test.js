import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
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
  const tree = renderer
    .create(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
