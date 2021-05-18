import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ScheduledDeployments from './scheduleddeployments';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ScheduledDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true,
          isHosted: false
        }
      },
      deployments: {
        ...defaultState.deployments,
        byStatus: {
          ...defaultState.deployments.byStatus,
          scheduled: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <ScheduledDeployments />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
