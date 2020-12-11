import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Devices, { convertQueryToFilterAndGroup } from './devices';
import { selectMaterialUiSelectOption } from '../../../../tests/setupTests';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Devices Component', () => {
  let store;
  it('renders correctly', () => {
    store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Devices />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
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

  it('works as expected', async () => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        selectedDeviceList: defaultState.devices.byStatus.accepted.deviceIds,
        groups: {
          ...defaultState.devices.groups,
          selectedGroup: 'testGroup'
        }
      }
    });
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Devices />
        </Provider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(defaultState.devices.byId.a1.id)).toBeInTheDocument());

    userEvent.click(screen.getByRole('tab', { name: /Pending/i }));
    userEvent.click(screen.getByRole('tab', { name: /Device groups/i }));

    expect(screen.getByRole('heading', { level: 2, name: 'testGroup' })).toBeInTheDocument();
    const deviceIdHeader = screen.getByText('Device ID');
    userEvent.click(deviceIdHeader.lastChild);
    const idDialog = screen.getByText('Default device identity attribute').parentElement.parentElement;
    expect(idDialog).toBeInTheDocument();
    await selectMaterialUiSelectOption(idDialog, 'mac');
    userEvent.click(within(idDialog).getByText(/Save/i));
    await waitForElementToBeRemoved(() => screen.getByText('Default device identity attribute'));
    userEvent.click(screen.getByRole('button', { name: 'testGroupDynamic' }));
    userEvent.click(screen.getByRole('button', { name: /Remove group/i }));

    const removalDialog = screen.getByText('This will remove the group from the list. Are you sure you want to continue?').parentElement.parentElement;
    expect(removalDialog).toBeInTheDocument();
    userEvent.click(within(removalDialog).getByRole('button', { name: /Remove group/i }));
    expect(removalDialog).toBeInTheDocument();

    const deviceListItem = screen.getByText(defaultState.devices.byId.a1.id);
    userEvent.click(deviceListItem);
    expect(screen.getByText(defaultState.devices.byId.a1.attributes.ipv4_wlan0)).toBeInTheDocument();
    userEvent.click(deviceListItem);
    expect(screen.queryByText(defaultState.devices.byId.a1.attributes.ipv4_wlan0)).toBeFalsy();
  });
});
