import React from 'react';
import { Provider } from 'react-redux';

import { prettyDOM } from '@testing-library/dom';
import { act, cleanup, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

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
    act(() => jest.advanceTimersByTime(5000));
    await waitFor(() => rerender(ui));
    const view = prettyDOM(asFragment().childNodes[1], 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
  });
});
