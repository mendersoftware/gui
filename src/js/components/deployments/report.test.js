import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';

const mockStore = configureStore([thunk]);
const store = mockStore({
  devices: {
    byStatus: {
      accepted: { total: 0 }
    }
  },
  deployments: {
    byId: {
      a1: {
        devices: {},
        artifact_name: 'test',
        created: '2019-01-01',
        finished: '2019-01-01'
      }
    }
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport deployment={{ id: 'a1' }} />
        </Provider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
