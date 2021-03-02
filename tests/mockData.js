import { rolesByName } from '../src/js/constants/userConstants';

export const undefineds = /undefined|\[object Object\]/;
window.mender_environment = {
  features: {
    hasMultitenancy: true
  },
  services: {
    deploymentsVersion: null,
    deviceauthVersion: null,
    inventoryVersion: null
  }
};

export const TEST_SESSION_DATETIME = '2019-01-01T13:00:00.000Z';
const testDate = new Date(TEST_SESSION_DATETIME);
export const mockDate = new Date(testDate.setMilliseconds(testDate.getMilliseconds() + 900));

export const token =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNkMGY4Yy1hZWRlLTQwMzAtYjM5MS03ZDUwMjBlYjg3M2UiLCJzdWIiOiJhMzBhNzgwYi1iODQzLTUzNDQtODBlMy0wZmQ5NWE0ZjZmYzMiLCJleHAiOjE2MDY4MTUzNjksImlhdCI6MTYwNjIxMDU2OSwibWVuZGVyLnRlbmFudCI6IjVmODVjMTdiY2U2MmI3ZmE3ZjVmNzA0MCIsIm1lbmRlci51c2VyIjp0cnVlLCJpc3MiOiJNZW5kZXIgVXNlcnMiLCJzY3AiOiJtZW5kZXIuKiIsIm1lbmRlci5wbGFuIjoicHJvZmVzc2lvbmFsIiwibmJmIjoxNjA2MjEwNTY5fQ.qVgYdCzLTf8OdK9uUctqqaY_HWkIiwpekuGvuGQAXCEgOv4bRNDlZRN_ZRSbxQoARG3pquhScbQrjBV9tcF4irTUPlTn3yrsXNO17DpcbTVeKRkb88RDtIKiRw3orVZ_GlIb-ckTQ5dS-Nqlyyf3Fmrhca-gwt6m_xv2UrmJK6eYYTMfggdRRWb-4u7mEkBI_pHPMTQrT8kJ2BeX-vHgazH9AoH0k85LHtFZQXD7pXHlDZRnLxJXukncwMGDmF17374gavYAIyDIzcC8sEBMDnVXgpikeA1sauzirqix6mAVs6XmxdQO7aF0wfXO1_PTYUA3Nk1oQfMYNlEI3U9uLRJRZIq2L8fmrrBryhstKd4y0KlBbGAQrx8NtRkgajjd1ljMfPBUEZrb7uSerVjneiO-aIBO76CuH0zdklphIjpGJeogkBhe8pAYNggp1XsZHgpZfl7IE5faKaDkMGnutaea--Czor6bhqUNCuY4tR0cpQJbNwy6LS9o1CFy4Log';

export const defaultState = {
  app: {
    hostedAnnouncement: null,
    docsVersion: null,
    features: {
      isDemoMode: false
    },
    snackbar: {},
    versionInformation: {}
  },
  deployments: {
    byId: {
      d1: {
        id: 'd1',
        name: 'test deployment',
        artifact_name: 'test',
        artifacts: ['123'],
        created: '2019-01-01T12:30:00.000Z',
        device_count: 1,
        devices: {
          a1: {
            attributes: {},
            id: 'a1',
            status: 'installing'
          }
        },
        stats: {
          downloading: 0,
          decommissioned: 0,
          failure: 0,
          installing: 1,
          noartifact: 0,
          pending: 0,
          rebooting: 0,
          success: 0,
          'already-installed': 0
        }
      },
      d2: {
        id: 'd2',
        name: 'test deployment 2',
        artifact_name: 'test',
        artifacts: ['123'],
        created: '2019-01-01T12:25:00.000Z',
        device_count: 1,
        devices: {
          b1: {
            attributes: {},
            id: 'b1',
            status: 'pending'
          }
        },
        stats: {
          downloading: 0,
          decommissioned: 0,
          failure: 0,
          installing: 0,
          noartifact: 0,
          pending: 1,
          rebooting: 0,
          success: 0,
          'already-installed': 0
        }
      }
    },
    byStatus: {
      finished: { deploymentIds: ['d1'], selectedDeploymentIds: ['d1'], total: 1 },
      inprogress: { deploymentIds: ['d1'], selectedDeploymentIds: ['d1'], total: 1 },
      pending: { deploymentIds: ['d2'], selectedDeploymentIds: ['d2'], total: 1 },
      scheduled: { deploymentIds: ['d2'], selectedDeploymentIds: ['d2'], total: 1 }
    },
    deploymentDeviceLimit: 500,
    selectedDeployment: 'd1'
  },
  devices: {
    byId: {
      a1: {
        id: 'a1',
        attributes: {
          ipv4_wlan0: '192.168.10.141/24'
        },
        identity_data: { mac: 'dc:a6:32:12:ad:bf' },
        status: 'accepted',
        decommissioning: false,
        created_ts: '2019-01-01T06:25:00.000Z',
        updated_ts: '2019-01-01T09:25:00.000Z',
        auth_sets: [
          {
            id: 'auth1',
            identity_data: { mac: 'dc:a6:32:12:ad:bf' },
            pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
            ts: '2019-01-01T06:25:00.000Z',
            status: 'accepted'
          }
        ]
      },
      b1: {
        id: 'b1',
        attributes: {
          ipv4_wlan0: '192.168.10.141/24',
          device_type: 'qemux86-64'
        },
        identity_data: { mac: 'dc:a6:32:12:ad:bf' },
        status: 'accepted',
        decommissioning: false,
        created_ts: '2019-01-01T06:25:00.000Z',
        updated_ts: '2019-01-01T09:25:00.000Z',
        auth_sets: [
          {
            id: 'auth1',
            identity_data: { mac: 'dc:a6:32:12:ad:bf' },
            pubkey: '-----BEGIN PUBLIC KEY-----\nMIIBojWELzgJ62hcXIhAfqfoNiaB1326XZByZwcnHr5BuSPAgMBAAE=\n-----END PUBLIC KEY-----\n',
            ts: '2019-01-01T06:25:00.000Z',
            status: 'accepted'
          }
        ]
      },
      c1: {
        id: 'c1',
        auth_sets: [],
        attributes: {
          device_type: 'qemux86-128'
        }
      }
    },
    byStatus: {
      accepted: { deviceIds: ['a1', 'b1'], total: 2 },
      active: { deviceIds: [], total: 0 },
      inactive: { deviceIds: [], total: 0 },
      pending: { deviceIds: ['c1'], total: 1 },
      preauthorized: { deviceIds: [], total: 0 },
      rejected: { deviceIds: [], total: 0 }
    },
    filteringAttributes: {
      identityAttributes: ['mac'],
      inventoryAttributes: ['artifact_name']
    },
    filteringAttributesLimit: 10,
    filters: [],
    groups: {
      byId: {
        testGroup: {
          deviceIds: ['a1', 'b1'],
          filters: [],
          total: 2
        },
        testGroupDynamic: {
          id: 'filter1',
          filters: [{ scope: 'system', key: 'group', operator: '$eq', value: 'things' }]
        }
      },
      selectedGroup: null
    },
    limit: 500,
    selectedDeviceList: []
  },
  onboarding: {
    complete: false,
    demoArtifactPort: 85,
    showCreateArtifactDialog: false,
    showConnectDeviceDialog: false,
    showTipsDialog: false
  },
  organization: {
    card: {
      brand: 'testCorp',
      last4: '7890',
      expiration: { month: 1, year: 2024 }
    },
    events: [
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string@example.com'
        },
        time: '2019-01-01T12:10:22.667Z',
        action: 'create',
        object: {
          id: 'string',
          type: 'user',
          user: {
            email: 'user@acme.com'
          }
        },
        change: 'change1'
      },
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string',
          identity_data: 'string'
        },
        time: '2019-01-01T12:16:22.667Z',
        action: 'create',
        object: {
          id: 'string',
          type: 'deployment',
          deployment: {
            name: 'production',
            artifact_name: 'Application 0.0.1'
          }
        },
        change: 'change2'
      },
      {
        actor: {
          id: 'string',
          type: 'user',
          email: 'string@example.com'
        },
        time: '2019-01-01T12:10:22.667Z',
        action: 'open_terminal',
        meta: {
          session_id: ['abd313a8-ee88-48ab-9c99-fbcd80048e6e']
        },
        object: {
          id: 'a1',
          type: 'device'
        },
        change: 'change3'
      }
    ],
    eventsTotal: 3,
    intentId: 'testIntent',
    organization: {
      id: 1,
      name: 'test',
      plan: 'os',
      trial: false
    }
  },
  releases: {
    artifactProgress: 0,
    byId: {
      a1: {
        Name: 'a1',
        Artifacts: [
          {
            id: 'art1',
            description: 'test description',
            device_types_compatible: ['qemux86-64'],
            modified: '2020-09-10T12:16:22.667Z',
            updates: [{ type_info: 'testtype' }],
            artifact_depends: {
              device_type: ['qemux86-64']
            },
            artifact_provides: {
              artifact_name: 'myapp',
              'data-partition.myapp.version': 'v2020.10',
              list_of_fancy: ['qemux86-64', 'x172']
            },
            clears_artifact_provides: ['data-partition.myapp.*']
          }
        ],
        device_types_compatible: ['qemux86-64'],
        metaData: {}
      }
    },
    selectedArtifact: null,
    selectedRelease: null,
    showRemoveDialog: false,
    uploading: false
  },
  users: {
    byId: {
      a1: { email: 'a@b.com', id: 'a1', created_ts: '2019-01-01T10:30:00.000Z', roles: [rolesByName.admin] },
      'a30a780b-b843-5344-80e3-0fd95a4f6fc3': { email: 'a2@b.com', id: 'a30a780b-b843-5344-80e3-0fd95a4f6fc3', created_ts: '2019-01-01T12:30:00.000Z' }
    },
    currentUser: 'a1',
    globalSettings: { id_attribute: 'Device ID', previousFilters: [] },
    jwtToken: null,
    qrCode: null,
    rolesById: {
      RBAC_ROLE_PERMIT_ALL: { title: 'Admin', allowUserManagement: true, groups: [], description: 'Full access', editable: false, permissions: [] },
      RBAC_ROLE_OBSERVER: {
        title: 'Read only',
        allowUserManagement: false,
        groups: [],
        description:
          'Intended for team leaders or limited tech support accounts, this role can see all Devices, Artifacts and Deployment reports but not make any changes.',
        editable: false,
        permissions: []
      },
      RBAC_ROLE_CI: { title: 'CI', allowUserManagement: false, groups: [], description: '', editable: false, permissions: [] },
      test: { title: 'test', description: 'test description', groups: ['testgroup'], editable: true }
    },
    showHelptips: true
  }
};
