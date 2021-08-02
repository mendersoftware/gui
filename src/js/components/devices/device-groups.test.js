import React from 'react';
import { prettyDOM } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeviceGroups, { convertQueryToFilterAndGroup, generateBrowserLocation } from './device-groups';
import { defaultState, undefineds } from '../../../../tests/mockData';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';

const mockStore = configureStore([thunk]);

describe('DeviceGroups Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      devices: {
        ...defaultState.devices,
        groups: {
          ...defaultState.devices.groups,
          selectedGroup: 'testGroup'
        },
        deviceList: {
          ...defaultState.devices.deviceList,
          deviceIds: defaultState.devices.byStatus.accepted.deviceIds
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <DeviceGroups />
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

  it('uses working utilties - convertQueryToFilterAndGroup', () => {
    const { groupName, filters } = convertQueryToFilterAndGroup(
      '?some=thing&group=testgroup&id=someId&mac=donalds&existing=filter',
      defaultState.devices.filteringAttributes,
      [{ key: 'existing', operator: '$wat', scope: 'special', value: 'filter' }]
    );
    expect(groupName).toEqual('testgroup');
    expect(filters).toEqual([
      { key: 'id', operator: '$eq', scope: 'identity', value: 'someId' },
      { key: 'some', operator: '$eq', scope: 'inventory', value: 'thing' },
      { key: 'mac', operator: '$eq', scope: 'identity', value: 'donalds' },
      { key: 'existing', operator: '$wat', scope: 'special', value: 'filter' }
    ]);
  });

  const devicesPath = '/devices/asd';
  const devicesSearch = '?some=thing&different=thing&entirely=different';
  it('uses working utilties - generateBrowserLocation', () => {
    const { pathname, search } = generateBrowserLocation(
      DEVICE_STATES.pending,
      [{ key: 'some', value: 'thing' }],
      'testgroup',
      { pathname: devicesPath, search: devicesSearch },
      false
    );
    expect(pathname).toEqual('/devices/pending');
    expect(search).toEqual('some=thing&group=testgroup');
  });

  it('uses working utilties - generateBrowserLocation - on init', () => {
    const { pathname, search } = generateBrowserLocation(
      DEVICE_STATES.pending,
      [{ key: 'some', value: 'thing' }],
      'testgroup',
      { pathname: devicesPath, search: devicesSearch },
      true
    );
    expect(pathname).toEqual('/devices/pending');
    expect(search).toEqual('some=thing&different=thing&entirely=different&group=testgroup');
  });

  it('uses working utilties - generateBrowserLocation - with ungrouped selected', () => {
    const { search } = generateBrowserLocation(
      DEVICE_STATES.pending,
      [{ key: 'some', value: 'thing' }],
      UNGROUPED_GROUP.id,
      { pathname: devicesPath, search: devicesSearch },
      true
    );
    expect(search).toEqual('');
  });
});
