import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Progress from './inprogressdeployments';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Progress progress={[]} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
