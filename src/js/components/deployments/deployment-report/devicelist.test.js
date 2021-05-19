import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { prettyDOM } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ProgressDeviceList from './devicelist';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ProgressDeviceList Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <ProgressDeviceList
            allDevices={Object.values(defaultState.deployments.byId.d1.devices)}
            created={defaultState.deployments.byId.d1.created}
            deployment={defaultState.deployments.byId.d1}
            devicesById={defaultState.devices.byId}
            getDeviceById={jest.fn}
            getDeviceAuth={jest.fn}
            retries={3}
          />
        </Provider>
      </MemoryRouter>
    );
    const view = prettyDOM(baseElement.firstChild.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
