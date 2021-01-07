import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Pending from './pending-devices';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PendingDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        selectedDeviceList: defaultState.devices.byStatus.pending.deviceIds
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Pending />
        </Provider>
      </MemoryRouter>
    );
    await waitFor(() => expect(document.querySelector('.loaderContainer.shrunk')).toBeInTheDocument());
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
