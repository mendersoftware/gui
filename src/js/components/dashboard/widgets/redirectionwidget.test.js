import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import RedirectionWidget from './redirectionwidget';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <RedirectionWidget target="testlocation" buttonContent={<div />} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
