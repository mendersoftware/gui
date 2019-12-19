import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import Progress from './inprogressdeployments';

describe('InProgressDeployments Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <Progress items={[]} refreshItems={() => {}} type="progress" title="in progress" />
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
