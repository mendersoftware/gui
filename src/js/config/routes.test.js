import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import Routes from './routes';

import Login from '../components/user-management/login';
import Settings from '../components/settings/settings';

test('invalid path should redirect to Dashboard', () => {
  const wrapper = mount(<MemoryRouter initialEntries={['/random']}>{Routes}</MemoryRouter>);
  expect(wrapper.find(Settings)).toHaveLength(0);
  expect(wrapper.find(Login)).toHaveLength(1);
});

test('valid path should not redirect to 404', () => {
  const wrapper = mount(<MemoryRouter initialEntries={['/']}>{Routes}</MemoryRouter>);
  expect(wrapper.find(Settings)).toHaveLength(0);
  expect(wrapper.find(Login)).toHaveLength(1);
});
