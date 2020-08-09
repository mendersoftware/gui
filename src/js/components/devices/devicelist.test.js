import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceList from './devicelist';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('DeviceList Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <DeviceList
            devices={[]}
            selectedRows={[]}
            columnHeaders={[{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]}
            columnWidth={100}
            pageLength={10}
            pageTotal={50}
          />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
