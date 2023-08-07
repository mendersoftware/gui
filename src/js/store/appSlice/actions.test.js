// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { inventoryDevice } from '../../../tests/__mocks__/deviceHandlers';
import { defaultState, receivedPermissionSets, receivedRoles } from '../../../tests/mockData';
import {
  SET_ANNOUNCEMENT,
  SET_ENVIRONMENT_DATA,
  SET_FEATURES,
  SET_FIRST_LOGIN_AFTER_SIGNUP,
  SET_OFFLINE_THRESHOLD,
  SET_SEARCH_STATE,
  SET_SNACKBAR,
  SET_VERSION_INFORMATION,
  SORTING_OPTIONS
} from '../constants/appConstants';
import {
  RECEIVE_DEPLOYMENTS,
  RECEIVE_FINISHED_DEPLOYMENTS,
  RECEIVE_INPROGRESS_DEPLOYMENTS,
  SELECT_INPROGRESS_DEPLOYMENTS
} from '../constants/deploymentConstants';
import {
  ADD_DYNAMIC_GROUP,
  DEVICE_LIST_DEFAULTS,
  DEVICE_STATES,
  EXTERNAL_PROVIDER,
  RECEIVE_DEVICES,
  RECEIVE_DYNAMIC_GROUPS,
  RECEIVE_GROUPS,
  SET_ACCEPTED_DEVICES,
  SET_DEVICE_LIMIT,
  SET_DEVICE_LIST_STATE,
  SET_FILTER_ATTRIBUTES,
  SET_PENDING_DEVICES,
  SET_PREAUTHORIZED_DEVICES,
  SET_REJECTED_DEVICES,
  UNGROUPED_GROUP
} from '../constants/deviceConstants';
import { SET_DEMO_ARTIFACT_PORT, SET_ONBOARDING_ARTIFACT_INCLUDED, SET_ONBOARDING_COMPLETE } from '../constants/onboardingConstants';
import { RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, SET_ORGANIZATION } from '../constants/organizationConstants';
import { RECEIVE_RELEASES, SET_RELEASES_LIST_STATE } from '../constants/releaseConstants';
import { RECEIVED_PERMISSION_SETS, RECEIVED_ROLES, SET_GLOBAL_SETTINGS, SET_SHOW_HELP, SET_USER_SETTINGS } from '../constants/userConstants';
import {
  commonErrorHandler,
  getLatestReleaseInfo,
  initializeAppData,
  setFirstLoginAfterSignup,
  setOfflineThreshold,
  setSearchState,
  setSnackbar,
  setVersionInformation
} from './appActions';
import { expectedOnboardingActions } from './onboardingActions.test';
import { tenantDataDivergedMessage } from './organizationActions';

export const attributeReducer = (accu, item) => {
  if (item.scope === 'inventory') {
    accu[item.name] = item.value;
    if (item.name === 'device_type') {
      accu[item.name] = [].concat(item.value);
    }
  }
  return accu;
};
// eslint-disable-next-line no-unused-vars
const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
export const receivedInventoryDevice = {
  ...defaultState.devices.byId.a1,
  attributes: inventoryDevice.attributes.reduce(attributeReducer, {}),
  identity_data: { ...defaultState.devices.byId.a1.identity_data, status: 'accepted' },
  isNew: false,
  isOffline: true,
  monitor: {},
  tags: {},
  updated_ts: inventoryDevice.updated_ts
};
const latestSaasReleaseTag = 'saas-v2023.05.02';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

/* eslint-disable sonarjs/no-identical-functions */
describe('app actions', () => {
  it('should handle different error message formats', async () => {
    const store = mockStore({ ...defaultState });
    const err = { response: { data: { error: { message: 'test' } } }, id: '123' };
    await expect(commonErrorHandler(err, 'testContext', store.dispatch)).rejects.toEqual(err);
    const expectedActions = [
      {
        type: SET_SNACKBAR,
        snackbar: {
          open: true,
          message: `testContext ${err.response.data.error.message}`,
          maxWidth: '900px',
          autoHideDuration: null,
          action: 'Copy to clipboard',
          children: undefined,
          onClick: undefined,
          onClose: undefined
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should try to get all required app information', async () => {
    window.localStorage.getItem.mockReturnValueOnce('false');
    const store = mockStore({
      ...defaultState,
      app: { ...defaultState.app, features: { ...defaultState.app.features, isHosted: true } },
      users: { ...defaultState.users, globalSettings: { ...defaultState.users.globalSettings, id_attribute: { attribute: 'mac', scope: 'identity' } } },
      releases: { ...defaultState.releases, releasesList: { ...defaultState.releases.releasesList, page: 42 } }
    });

    const expectedActions = [
      { type: SET_ONBOARDING_COMPLETE, complete: false },
      { type: SET_DEMO_ARTIFACT_PORT, value: 85 },
      { type: SET_FEATURES, value: { ...defaultState.app.features, hasMultitenancy: true } },
      {
        type: SET_VERSION_INFORMATION,
        docsVersion: '',
        value: {
          Deployments: '1.2.3',
          Deviceauth: null,
          GUI: undefined,
          Integration: 'master',
          Inventory: null,
          'Mender-Artifact': undefined,
          'Mender-Client': 'next',
          'Meta-Mender': 'saas-123.34'
        }
      },
      { type: SET_ENVIRONMENT_DATA, value: { hostAddress: null, hostedAnnouncement: '', recaptchaSiteKey: '', stripeAPIKey: '', trackerCode: '' } },
      { type: SET_FIRST_LOGIN_AFTER_SIGNUP, firstLoginAfterSignup: false },
      {
        type: SET_VERSION_INFORMATION,
        docsVersion: '',
        value: {
          GUI: latestSaasReleaseTag,
          Integration: '1.2.3',
          'Mender-Artifact': '1.3.7',
          'Mender-Client': '3.2.1',
          backend: latestSaasReleaseTag,
          latestRelease: {
            releaseDate: '2022-02-02',
            repos: {
              integration: '1.2.3',
              mender: '3.2.1',
              'mender-artifact': '1.3.7',
              'other-service': '1.1.0',
              service: '3.0.0'
            }
          }
        }
      },
      { type: SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      { type: SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings } },
      { type: SET_OFFLINE_THRESHOLD, value: '2019-01-12T13:00:00.900Z' },
      {
        type: SET_FILTER_ATTRIBUTES,
        attributes: {
          identityAttributes: ['status', 'mac'],
          inventoryAttributes: [
            'artifact_name',
            'cpu_model',
            'device_type',
            'hostname',
            'ipv4_wlan0',
            'ipv6_wlan0',
            'kernel',
            'mac_eth0',
            'mac_wlan0',
            'mem_total_kB',
            'mender_bootloader_integration',
            'mender_client_version',
            'network_interfaces',
            'os',
            'rootfs_type'
          ],
          systemAttributes: ['created_ts', 'updated_ts', 'group'],
          tagAttributes: []
        }
      },
      { type: RECEIVE_DEPLOYMENTS, deployments: defaultState.deployments.byId },
      {
        type: RECEIVE_FINISHED_DEPLOYMENTS,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'finished',
        total: Object.keys(defaultState.deployments.byId).length
      },
      { type: RECEIVE_DEPLOYMENTS, deployments: defaultState.deployments.byId },
      {
        type: RECEIVE_INPROGRESS_DEPLOYMENTS,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'inprogress',
        total: Object.keys(defaultState.deployments.byId).length
      },
      {
        type: SELECT_INPROGRESS_DEPLOYMENTS,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'inprogress'
      },
      {
        type: RECEIVE_DEVICES,
        devicesById: {
          a1: {
            ...defaultState.devices.byId.a1,
            attributes: inventoryDevice.attributes.reduce(attributeReducer, {}),
            group: 'test',
            identity_data: { ...defaultState.devices.byId.a1.identity_data, status: 'accepted' },
            isNew: false,
            isOffline: true,
            monitor: {},
            tags: {},
            updated_ts: inventoryDevice.updated_ts
          }
        }
      },
      {
        type: SET_ACCEPTED_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.accepted.total }, () => defaultState.devices.byId.a1.id),
        status: 'accepted',
        total: defaultState.devices.byStatus.accepted.deviceIds.length
      },
      {
        type: RECEIVE_DEVICES,
        devicesById: {
          a1: {
            ...defaultState.devices.byId.a1,
            attributes: inventoryDevice.attributes.reduce(attributeReducer, {}),
            group: 'test',
            identity_data: { ...defaultState.devices.byId.a1.identity_data, status: 'accepted' },
            isNew: false,
            isOffline: true,
            monitor: {},
            status: 'pending',
            tags: {},
            updated_ts: inventoryDevice.updated_ts
          }
        }
      },
      {
        type: SET_PENDING_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.pending.total }, () => defaultState.devices.byId.a1.id),
        status: 'pending',
        total: defaultState.devices.byStatus.pending.deviceIds.length
      },
      { type: RECEIVE_DEVICES, devicesById: {} },
      { type: SET_PREAUTHORIZED_DEVICES, deviceIds: [], status: 'preauthorized', total: 0 },
      { type: RECEIVE_DEVICES, devicesById: {} },
      { type: SET_REJECTED_DEVICES, deviceIds: [], status: 'rejected', total: 0 },
      {
        type: RECEIVE_DYNAMIC_GROUPS,
        groups: {
          testGroup: defaultState.devices.groups.byId.testGroup,
          testGroupDynamic: {
            deviceIds: [],
            filters: [
              { key: 'id', operator: '$in', scope: 'identity', value: [defaultState.devices.byId.a1.id] },
              { key: 'mac', operator: '$nexists', scope: 'identity', value: false },
              { key: 'kernel', operator: '$exists', scope: 'identity', value: true }
            ],
            id: 'filter1',
            total: 0
          }
        }
      },
      {
        type: RECEIVE_GROUPS,
        groups: {
          testGroup: defaultState.devices.groups.byId.testGroup,
          testGroupDynamic: {
            filters: [{ key: 'group', operator: '$eq', scope: 'system', value: 'things' }],
            id: 'filter1'
          }
        }
      },
      {
        type: RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
        value: [
          { connection_string: 'something_else', id: 1, provider: EXTERNAL_PROVIDER['iot-hub'].provider },
          { id: 2, provider: 'aws', something: 'new' }
        ]
      },
      { type: RECEIVE_RELEASES, releases: defaultState.releases.byId },
      { type: SET_ONBOARDING_ARTIFACT_INCLUDED, value: true },
      {
        type: SET_RELEASES_LIST_STATE,
        value: { ...defaultState.releases.releasesList, releaseIds: [defaultState.releases.byId.r1.Name], page: 42 }
      },
      { type: SET_DEVICE_LIMIT, limit: 500 },
      { type: RECEIVED_PERMISSION_SETS, value: receivedPermissionSets },
      { type: RECEIVED_ROLES, value: receivedRoles },
      { type: SET_ORGANIZATION, organization: defaultState.organization.organization },
      { type: SET_ANNOUNCEMENT, announcement: tenantDataDivergedMessage },
      {
        type: RECEIVE_DEVICES,
        devicesById: { [expectedDevice.id]: { ...defaultState.devices.byId.a1, isNew: false, isOffline: true, monitor: {}, tags: {} } }
      },
      {
        type: RECEIVE_DEVICES,
        devicesById: { [expectedDevice.id]: { ...defaultState.devices.byId.a1, group: undefined, isNew: false, isOffline: true, monitor: {}, tags: {} } }
      },
      { type: RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: { ...receivedInventoryDevice, group: 'test' } } },
      {
        type: RECEIVE_DEVICES,
        devicesById: { [expectedDevice.id]: { ...defaultState.devices.byId.a1, group: undefined, isNew: false, isOffline: true, monitor: {}, tags: {} } }
      },
      {
        type: ADD_DYNAMIC_GROUP,
        groupName: UNGROUPED_GROUP.id,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', value: ['testGroup'], operator: '$nin', scope: 'system' }] }
      },
      {
        type: SET_DEVICE_LIST_STATE,
        state: {
          ...DEVICE_LIST_DEFAULTS,
          deviceIds: [],
          isLoading: true,
          selectedAttributes: [],
          selectedIssues: [],
          selection: [],
          setOnly: false,
          sort: { direction: SORTING_OPTIONS.desc },
          state: 'accepted',
          total: 0
        }
      },
      { type: SET_SHOW_HELP, show: true },
      { type: RECEIVE_DEVICES, devicesById: { [expectedDevice.id]: { ...receivedInventoryDevice, group: 'test' } } },
      {
        type: SET_ACCEPTED_DEVICES,
        deviceIds: [defaultState.devices.byId.a1.id, defaultState.devices.byId.a1.id],
        status: DEVICE_STATES.accepted,
        total: defaultState.devices.byStatus.accepted.total
      },
      { type: SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings } },
      { type: SET_USER_SETTINGS, settings: { ...defaultState.users.userSettings, showHelptips: true } },
      {
        type: RECEIVE_DEVICES,
        devicesById: { [expectedDevice.id]: { ...defaultState.devices.byId.a1, group: undefined, isNew: false, isOffline: true, monitor: {}, tags: {} } }
      },
      {
        type: SET_DEVICE_LIST_STATE,
        state: {
          ...DEVICE_LIST_DEFAULTS,
          deviceIds: ['a1', 'a1'],
          isLoading: false,
          selectedAttributes: [],
          selectedIssues: [],
          selection: [],
          sort: { direction: SORTING_OPTIONS.desc },
          state: 'accepted',
          total: 2
        }
      },
      ...expectedOnboardingActions
    ];
    await store.dispatch(initializeAppData());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => Object.keys(action).map(key => expect(storeActions[index][key]).toEqual(action[key])));
  });
  it('should pass snackbar information', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: SET_SNACKBAR,
        snackbar: {
          open: true,
          message: 'test',
          maxWidth: '900px',
          autoHideDuration: 20,
          action: undefined,
          children: undefined,
          onClick: undefined,
          onClose: undefined
        }
      }
    ];
    await store.dispatch(setSnackbar('test', 20));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should set version information', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: SET_VERSION_INFORMATION, value: { Integration: 'next' } }];
    await store.dispatch(setVersionInformation({ Integration: 'next' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should not get the latest release info when not hosted', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(getLatestReleaseInfo());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(0);
  });
  it('should get the latest release info when hosted', async () => {
    const store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isHosted: true
        }
      }
    });
    const expectedActions = [
      {
        type: SET_VERSION_INFORMATION,
        value: { backend: latestSaasReleaseTag, GUI: latestSaasReleaseTag, Integration: '1.2.3', 'Mender-Client': '3.2.1', 'Mender-Artifact': '1.3.7' }
      }
    ];
    await store.dispatch(getLatestReleaseInfo());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should store first login after Signup', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: SET_FIRST_LOGIN_AFTER_SIGNUP,
        firstLoginAfterSignup: true
      }
    ];
    await store.dispatch(setFirstLoginAfterSignup(true));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should calculate yesterdays timestamp', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: SET_OFFLINE_THRESHOLD, value: '2019-01-12T13:00:00.900Z' }];
    await store.dispatch(setOfflineThreshold());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should handle searching', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { type: SET_SEARCH_STATE, state: { ...defaultState.app.searchState, isSearching: true, searchTerm: 'next!' } },
      { type: RECEIVE_DEVICES, devicesById: {} },
      { type: SET_SEARCH_STATE, state: { ...defaultState.app.searchState, isSearching: false, searchTerm: '' } }
    ];
    await store.dispatch(setSearchState({ searchTerm: 'next!' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
