import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeviceList, { calculateResizeChange } from './devicelist';
import { getHeaders } from './authorized-devices';
import { routes } from './base-devices';

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
          columnHeaders={[{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }]}
          customColumnSizes={[]}
          devices={[]}
          deviceListState={defaultState.devices.deviceList}
          selectedRows={[]}
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

  it('allows column resizing calculations', async () => {
    const columnElements = [{ offsetWidth: 120 }, { offsetWidth: 120 }, { offsetWidth: 240 }, { offsetWidth: 120 }, { offsetWidth: 150 }, { offsetWidth: 120 }];
    const columnHeaders = [
      { attribute: { name: 'some', scope: 'thing' } },
      { attribute: { name: 'other', scope: 'thing' } },
      { attribute: { name: 'more', scope: 'thing' } },
      { attribute: { name: 'yet', scope: 'thing' } },
      { attribute: { name: 'different', scope: 'thing' } },
      { attribute: { name: 'last', scope: 'thing' } }
    ];
    let result = calculateResizeChange({ columnElements, columnHeaders, e: { clientX: 80 }, index: 2, prev: 90 });
    expect(result).toEqual([
      { attribute: { name: 'other', scope: 'thing' }, size: 240 },
      { attribute: { name: 'more', scope: 'thing' }, size: 110 },
      { attribute: { name: 'yet', scope: 'thing' }, size: 160 }
    ]);
    result = calculateResizeChange({ columnElements, columnHeaders, e: { clientX: 90 }, index: 2, prev: 80 });
    expect(result).toEqual([
      { attribute: { name: 'other', scope: 'thing' }, size: 240 },
      { attribute: { name: 'more', scope: 'thing' }, size: 130 },
      { attribute: { name: 'yet', scope: 'thing' }, size: 140 }
    ]);
    result = calculateResizeChange({ columnElements, columnHeaders, e: { clientX: 90 }, index: columnElements.length - 1, prev: 80 });
    expect(result).toEqual([
      { attribute: { name: 'other', scope: 'thing' }, size: 240 },
      { attribute: { name: 'more', scope: 'thing' }, size: 120 },
      { attribute: { name: 'yet', scope: 'thing' }, size: 150 }
    ]);
  });

  it('works as expected', async () => {
    const onExpandClickMock = jest.fn();
    const onResizeColumns = jest.fn();
    const onPageChange = jest.fn();
    const onSelect = jest.fn();
    const onSort = jest.fn();
    const devices = defaultState.devices.byStatus.accepted.deviceIds.map(id => defaultState.devices.byId[id]);
    const pageTotal = devices.length;
    const headers = getHeaders([], routes.allDevices.defaultHeaders, 'id', jest.fn);
    const ui = (
      <Provider store={store}>
        <DeviceList
          columnHeaders={headers}
          customColumnSizes={[]}
          devices={devices}
          deviceListState={defaultState.devices.deviceList}
          selectedRows={[]}
          headerKeys="1-2-3-4"
          idAttribute="id"
          onExpandClick={onExpandClickMock}
          onResizeColumns={onResizeColumns}
          onPageChange={onPageChange}
          onSelect={onSelect}
          onSort={onSort}
          pageTotal={pageTotal}
          setSnackbar={jest.fn}
        />
      </Provider>
    );
    render(ui);
    act(() => userEvent.click(screen.getByText(devices[0].id)));
    expect(onExpandClickMock).toHaveBeenCalled();

    act(() => userEvent.click(screen.getAllByRole('checkbox')[0]));
    expect(onSelect).toHaveBeenCalledWith([0, 1]);
    act(() => userEvent.click(screen.getAllByRole('checkbox')[2]));
    expect(onSelect).toHaveBeenCalledWith([1]);
  }, 30000);
});
