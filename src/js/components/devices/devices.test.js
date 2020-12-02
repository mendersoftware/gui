import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Devices, { convertQueryToFilterAndGroup } from './devices';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: { total: 0, deviceIds: [] }
        },
        groups: {
          ...defaultState.devices.groups,
          byId: {}
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <Provider store={store}>
            <Devices />
          </Provider>
        </MemoryRouter>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });

  it('converts url queries properly to filters and groups', () => {
    const { filters, groupName } = convertQueryToFilterAndGroup(
      '?group=test&thing=thang&mac%3D12%3A12%3A34%3A56&id=1234&artifact_name=testrelease',
      defaultState.devices.filteringAttributes
    );
    const identityFilters = filters.filter(filter => filter.scope === 'identity');
    const inventoryFilters = filters.filter(filter => filter.scope === 'inventory');
    expect(identityFilters).toHaveLength(2);
    expect(inventoryFilters).toHaveLength(2);
    expect(groupName).toEqual('test');
  });
  it('converts url queries properly to filters and groups without a query indicator', () => {
    const { filters, groupName } = convertQueryToFilterAndGroup(
      'group=test&thing=thang&mac%3D12%3A12%3A34%3A56&id=1234&artifact_name=testrelease',
      defaultState.devices.filteringAttributes
    );
    const identityFilters = filters.filter(filter => filter.scope === 'identity');
    const inventoryFilters = filters.filter(filter => filter.scope === 'inventory');
    expect(identityFilters).toHaveLength(2);
    expect(inventoryFilters).toHaveLength(2);
    expect(groupName).toEqual('test');
  });
});
