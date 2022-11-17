import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { act, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { adminUserCapabilities, defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import ProgressDeviceList from './devicelist';

const mockStore = configureStore([thunk]);

describe('ProgressDeviceList Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  afterEach(cleanup);

  it('renders correctly', async () => {
    const ui = (
      <Provider store={store}>
        <ProgressDeviceList
          selectedDevices={Object.values(defaultState.deployments.byId.d1.devices)}
          deployment={defaultState.deployments.byId.d1}
          getDeploymentDevices={jest.fn}
          getDeviceById={jest.fn}
          getDeviceAuth={jest.fn}
          userCapabilities={adminUserCapabilities}
        />
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
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
