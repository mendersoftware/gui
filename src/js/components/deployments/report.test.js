import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentReport from './report';

const mockStore = configureStore([thunk]);

describe('DeploymentReport Component', () => {
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
        selectedDeviceIds: [defaultState.deployments.byId.d1.devices.a1.id],
        selectionState: {
          selectedId: defaultState.deployments.byId.d1.id
        }
      }
    });
  });

  afterEach(cleanup);

  it('renders correctly', async () => {
    const ui = (
      <Provider store={store}>
        <DeploymentReport open type="finished" getDeploymentDevices={jest.fn} getDeviceById={jest.fn} getDeviceAuth={jest.fn} />
      </Provider>
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
