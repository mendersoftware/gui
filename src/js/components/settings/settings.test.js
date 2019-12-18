import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MyOrganization from './organization';

const mockStore = configureStore([]);
const store = mockStore({
  app: { features: { isHosted: false, hasMultitenancy: true } }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <MyOrganization />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
