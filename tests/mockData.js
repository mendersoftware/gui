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
        auth_sets: [],
        attributes: {}
      },
      b1: {
        auth_sets: [],
        attributes: {}
      }
    },
    byStatus: {
      accepted: { deviceIds: ['a1'], total: 0 },
      active: { deviceIds: [], total: 0 },
      inactive: { deviceIds: [], total: 0 },
      pending: { deviceIds: ['b1'], total: 0 },
      preauthorized: { deviceIds: [], total: 0 },
      rejected: { deviceIds: [], total: 0 }
    },
    filteringAttributes: {
      identityAttributes: ['id_attribute'],
      inventoryAttributes: []
    },
    filteringAttributesLimit: 10,
    filters: [],
    groups: {
      byId: {
        testGroup: {
          filters: []
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
        time: '2020-09-10T12:10:22.667Z',
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
        time: '2020-09-10T12:16:22.667Z',
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
      }
    ],
    eventsTotal: 2,
    intentId: 'testIntent',
    organization: {
      id: 1,
      name: 'test'
    }
  },
  releases: {
    artifactProgress: 0,
    byId: {
      a1: {
        Name: 'a1',
        device_types_compatible: []
      }
    },
    selectedArtifact: null,
    selectedRelease: null,
    showRemoveDialog: false,
    uploading: false
  },
  users: {
    byId: { a1: { email: 'a@b.com', id: 'a1' } },
    currentUser: 'a1',
    globalSettings: { id_attribute: 'Device ID', previousFilters: [] },
    rolesById: { RBAC_ROLE_PERMIT_ALL: { title: 'Admin', allowUserManagement: true, groups: [], description: 'Full access', editable: false } },
    showHelptips: true
  }
};
