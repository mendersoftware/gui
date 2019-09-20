import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import Progress from './inprogressdeployments';

it('renders correctly', () => {
  const tree = createMount()(
    <MemoryRouter>
      <Progress progress={[]} />
    </MemoryRouter>
  );
  expect(tree.html()).toMatchSnapshot();
});
