import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentCompleteTip from './deploymentcompletetip';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeploymentCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      devices: {
        byId: {},
        byStatus: { accepted: { deviceIds: [] } },
        filters: []
      }
    });
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
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
