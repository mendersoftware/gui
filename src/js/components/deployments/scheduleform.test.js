import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ScheduleForm from './scheduleform';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <ScheduleForm artifacts={[]} groups={[]} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
