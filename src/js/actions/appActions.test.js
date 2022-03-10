import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { inventoryDevice } from '../../../tests/__mocks__/deviceHandlers';
import { roles } from '../../../tests/__mocks__/userHandlers';
import { defaultState } from '../../../tests/mockData';

import { commonErrorHandler, initializeAppData, setSnackbar, setFirstLoginAfterSignup, setYesterday, setVersionInfo } from './appActions';
import AppConstants from '../constants/appConstants';
import DeploymentConstants from '../constants/deploymentConstants';
import DeviceConstants, { EXTERNAL_PROVIDER } from '../constants/deviceConstants';
import ReleaseConstants from '../constants/releaseConstants';
import OnboardingConstants from '../constants/onboardingConstants';
import OrganizationConstants from '../constants/organizationConstants';
import UserConstants from '../constants/userConstants';

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
        type: AppConstants.SET_SNACKBAR,
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
    const attributeReducer = (accu, item) => {
      if (item.scope === 'inventory') {
        accu[item.name] = item.value;
        if (item.name === 'device_type') {
          accu[item.name] = [].concat(item.value);
        }
      }
      return accu;
    };
    const store = mockStore({
      ...defaultState,
      app: { ...defaultState.app, features: { ...defaultState.app.features, isHosted: true } },
      users: { ...defaultState.users, globalSettings: { ...defaultState.users.globalSettings, id_attribute: { attribute: 'mac', scope: 'identity' } } },
      releases: { ...defaultState.releases, releasesList: { ...defaultState.releases.releasesList, page: 42 } }
    });
    // eslint-disable-next-line no-unused-vars
    const { attributes, ...expectedDevice } = defaultState.devices.byId.a1;
    const expectedActions = [
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings } },
      {
        type: DeviceConstants.SET_FILTER_ATTRIBUTES,
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
          tagAttributes: []
        }
      },
      {
        type: DeploymentConstants.RECEIVE_FINISHED_DEPLOYMENTS,
        deployments: defaultState.deployments.byId,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'finished',
        total: Object.keys(defaultState.deployments.byId).length
      },
      {
        type: DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS,
        deployments: defaultState.deployments.byId,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'inprogress',
        total: Object.keys(defaultState.deployments.byId).length
      },
      {
        type: DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        status: 'inprogress'
      },
      {
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: {
          a1: {
            ...defaultState.devices.byId.a1,
            attributes: inventoryDevice.attributes.reduce(attributeReducer, {}),
            identity_data: { ...defaultState.devices.byId.a1.identity_data, status: 'accepted' },
            isOffline: false,
            monitor: {},
            tags: {},
            updated_ts: inventoryDevice.updated_ts
          }
        }
      },
      {
        type: DeviceConstants.SET_ACCEPTED_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.accepted.total }, () => defaultState.devices.byId.a1.id),
        status: 'accepted',
        total: defaultState.devices.byStatus.accepted.deviceIds.length
      },
      {
        type: DeviceConstants.RECEIVE_DEVICES,
        devicesById: {
          a1: {
            ...defaultState.devices.byId.a1,
            attributes: inventoryDevice.attributes.reduce(attributeReducer, {}),
            identity_data: { ...defaultState.devices.byId.a1.identity_data, status: 'accepted' },
            isOffline: false,
            monitor: {},
            status: 'pending',
            tags: {},
            updated_ts: inventoryDevice.updated_ts
          }
        }
      },
      {
        type: DeviceConstants.SET_PENDING_DEVICES,
        deviceIds: Array.from({ length: defaultState.devices.byStatus.pending.total }, () => defaultState.devices.byId.a1.id),
        status: 'pending',
        total: defaultState.devices.byStatus.pending.deviceIds.length
      },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: {} },
      { type: DeviceConstants.SET_PREAUTHORIZED_DEVICES, deviceIds: [], status: 'preauthorized', total: 0 },
      { type: DeviceConstants.RECEIVE_DEVICES, devicesById: {} },
      { type: DeviceConstants.SET_REJECTED_DEVICES, deviceIds: [], status: 'rejected', total: 0 },
      {
        type: DeviceConstants.RECEIVE_DYNAMIC_GROUPS,
        groups: {
          testGroupDynamic: {
            deviceIds: [],
            filters: [{ key: 'id', operator: '$in', scope: 'identity', value: [defaultState.devices.byId.a1.id] }],
            id: 'filter1',
            total: 0
          }
        }
      },
      { type: DeviceConstants.RECEIVE_GROUPS, groups: { testGroup: defaultState.devices.groups.byId.testGroup } },
      {
        type: DeviceConstants.ADD_DYNAMIC_GROUP,
        groupName: DeviceConstants.UNGROUPED_GROUP.id,
        group: { deviceIds: [], total: 0, filters: [{ key: 'group', value: ['testGroup'], operator: '$nin', scope: 'system' }] }
      },
      {
        type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
        value: [
          { connection_string: 'something_else', id: 1, provider: EXTERNAL_PROVIDER['iot-hub'].provider },
          { id: 2, provider: 'aws', something: 'new' }
        ]
      },
      { type: ReleaseConstants.RECEIVE_RELEASES, releases: defaultState.releases.byId },
      {
        type: ReleaseConstants.SET_RELEASES_LIST_STATE,
        value: { ...defaultState.releases.releasesList, releaseIds: [defaultState.releases.byId.r1.Name], page: 42 }
      },
      { type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value: true },
      {
        type: ReleaseConstants.SET_RELEASES_LIST_STATE,
        value: { ...defaultState.releases.releasesList, searchAttribute: 'name', page: 42 }
      },
      { type: DeviceConstants.SET_DEVICE_LIMIT, limit: 500 },
      {
        type: UserConstants.RECEIVED_ROLES,
        rolesById: Object.entries(defaultState.users.rolesById).reduce((accu, [key, item]) => {
          accu[key] = {
            ...item,
            allowUserManagement: item.allowUserManagement || false,
            permissions: roles.find(role => role.name === key).permissions
          };
          return accu;
        }, {})
      },
      { type: OrganizationConstants.SET_ORGANIZATION, organization: defaultState.organization.organization },
      {
        type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
        stats: { ...defaultState.deployments.byId.d1.stats },
        deploymentId: defaultState.deployments.byId.d1.id
      },
      {
        type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
        stats: { ...defaultState.deployments.byId.d2.stats },
        deploymentId: defaultState.deployments.byId.d2.id
      },
      {
        type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
        stats: { ...defaultState.deployments.byId.d1.stats },
        deploymentId: defaultState.deployments.byId.d1.id
      },
      {
        type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
        stats: { ...defaultState.deployments.byId.d2.stats },
        deploymentId: defaultState.deployments.byId.d2.id
      },
      { type: DeviceConstants.RECEIVE_DEVICE_AUTH, device: expectedDevice },
      { type: DeviceConstants.RECEIVE_DEVICE_AUTH, device: expectedDevice },
      {
        type: DeviceConstants.SET_DEVICE_LIST_STATE,
        state: {
          ...DeviceConstants.DEVICE_LIST_DEFAULTS,
          deviceIds: [],
          selectedAttributes: [],
          selectedIssues: [],
          selection: [],
          sort: { columns: [], direction: AppConstants.SORTING_OPTIONS.desc },
          state: 'accepted',
          total: 0
        }
      },
      { type: UserConstants.SET_SHOW_HELP, show: true },
      {
        type: UserConstants.SET_GLOBAL_SETTINGS,
        settings: {
          ...defaultState.users.globalSettings,
          id_attribute: { attribute: 'mac', scope: 'identity' },
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            showHelptips: true
          }
        }
      }
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
        type: AppConstants.SET_SNACKBAR,
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
    const expectedActions = [{ type: AppConstants.SET_VERSION_INFORMATION, value: { Integration: 'next' } }];
    await store.dispatch(setVersionInfo({ Integration: 'next' }));
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
  it('should store first login after Signup', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
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
    const expectedActions = [{ type: AppConstants.SET_YESTERDAY, value: '2018-12-31T13:00:00.900Z' }];
    await store.dispatch(setYesterday());
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
