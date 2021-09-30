import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentReport from './report';
import { defaultState } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeploymentReport Component', () => {
  jest.useFakeTimers();

  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byId: {
          ...defaultState.deployments.byId,
          d1: {
            ...defaultState.deployments.byId.d1,
            artifact_name: 'a1'
          }
        },
        selectedDeployment: defaultState.deployments.byId.d1.id,
        selectedDeviceIds: [defaultState.deployments.byId.d1.devices.a1.id]
      }
    });
  });

  afterEach(cleanup);

  it('renders correctly', async () => {
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <DeploymentReport open type="finished" getDeploymentDevices={jest.fn} getDeviceById={jest.fn} getDeviceAuth={jest.fn} />
        </Provider>
      </MemoryRouter>
    );
    const { asFragment, rerender } = render(ui);
    jest.advanceTimersByTime(5000);
    waitFor(() => rerender(ui));
    const view = prettyDOM(asFragment().childNodes[1], 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
  });
});
