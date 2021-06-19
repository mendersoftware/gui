import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { prettyDOM } from '@testing-library/dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
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
  it('renders correctly', async () => {
    store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Devices />
        </Provider>
      </MemoryRouter>
    );
    // special snapshot handling here to work around unstable ids in mui code...
    const view = prettyDOM(baseElement.firstChild, 100000, { highlight: false })
      .replace(/id="mui-[0-9]*"/g, '')
      .replace(/aria-labelledby="(mui-[0-9]* *)*"/g, '')
      .replace(/\\/g, '');
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('converts url queries properly to filters and groups', async () => {
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
  it('converts url queries properly to filters and groups without a query indicator', async () => {
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
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Devices />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    await waitFor(() => expect(screen.getByText(defaultState.devices.byId.a1.id)).toBeInTheDocument());

    userEvent.click(screen.getByRole('tab', { name: /Pending/i }));
    userEvent.click(screen.getByRole('tab', { name: /Device groups/i }));

    expect(screen.getByRole('heading', { level: 2, name: 'testGroup' })).toBeInTheDocument();
    const deviceIdHeader = screen.getByText('Device ID');
    userEvent.click(deviceIdHeader.lastChild);
    const idDialogHeader = screen.getByText('Default device identity attribute');
    const idDialog = idDialogHeader.parentElement.parentElement;
    expect(idDialog).toBeInTheDocument();
    await selectMaterialUiSelectOption(idDialog, 'mac');
    act(() => userEvent.click(within(idDialog).getByText(/Save/i)));
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.queryByText('Default device identity attribute')).not.toBeInTheDocument(), { timeout: 5000 });
    // await waitForElementToBeRemoved(screen.queryByText('Default device identity attribute'), { timeout: 5000 });
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
  }, 10000);
});
