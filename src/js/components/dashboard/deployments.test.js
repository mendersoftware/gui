import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Deployments from './deployments';

const mockStore = configureStore([]);
const store = mockStore({
  deployments: {
    byId: {},
    byStatus: {
      finished: { total: 0 },
      inprogress: { total: 0 },
      pending: { total: 0 }
    }
  }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <Deployments getDeployments={() => Promise.resolve()} setSnackbar={jest.fn()} />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
