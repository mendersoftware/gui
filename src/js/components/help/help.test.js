import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import Help from './help';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Help location={{ pathname: 'test' }} />
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
