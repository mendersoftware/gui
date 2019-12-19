import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentCompleteTip from './deploymentcompletetip';

const mockStore = configureStore([thunk]);
const store = mockStore({
  devices: {
    byId: {},
    byStatus: { accepted: { deviceIds: [] } }
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <DeploymentCompleteTip />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
