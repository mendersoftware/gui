import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceList from './devicelist';

const mockStore = configureStore([thunk]);

describe('DeviceList Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <DeviceList
          devices={[]}
          deviceListState={defaultState.devices.deviceList}
          selectedRows={[]}
          columnHeaders={[{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]}
          pageTotal={50}
        />
      </Provider>
    );
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
