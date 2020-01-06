import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createMount } from '@material-ui/core/test-utils';
import RedirectionWidget from './redirectionwidget';

describe('RedirectionWidget Component', () => {
  it('renders correctly', () => {
    const tree = createMount()(
      <MemoryRouter>
        <RedirectionWidget target="testlocation" buttonContent={<div />} />
      </MemoryRouter>
    );
    expect(tree.html()).toMatchSnapshot();
  });
});
