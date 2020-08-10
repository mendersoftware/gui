import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Deployments from './deployments';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Deployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,

      deployments: {
        ...defaultState.deployments,
        byId: {},
        byStatus: {
          finished: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          inprogress: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          pending: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Deployments location={{ search: '' }} />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
