import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PastDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {},
        byStatus: {
          ...defaultState.deployments.byStatus,
          finished: {
            selectedDeploymentIds: []
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Past past={[]} groups={[]} refreshPast={() => {}} refreshDeployments={jest.fn} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
