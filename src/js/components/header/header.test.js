import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { AppContext } from '../../contexts/app-context';
import Header from './header';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <AppContext.Provider value={{ location: { pathname: 'test' } }}>
          {context => {
            <Header {...context} />;
          }}
        </AppContext.Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
