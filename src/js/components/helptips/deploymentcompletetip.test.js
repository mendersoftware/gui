import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DeploymentCompleteTip from './deploymentcompletetip';

const mockStore = configureStore([]);
const store = mockStore({
  devices: {
    byId: {},
    byStatus: { accepted: { deviceIds: [] } }
  }
});
store.dispatch = jest.fn();

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <DeploymentCompleteTip getDevicesByStatus={() => Promise.resolve()} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
