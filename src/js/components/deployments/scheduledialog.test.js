import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import ScheduleDialog from './scheduledialog';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <ScheduleDialog />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
