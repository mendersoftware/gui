import * as AppConstants from '../constants/appConstants';
import { stringToBoolean } from '../helpers';

const menderEnvironment = {
  hostAddress: null,
  features: {
    hasMultitenancy: false,
    isHosted: false,
    isEnterprise: false,
    isDemoMode: false
  },
  docsVersion: '',
  hostedAnnouncement: '',
  hostedLinks: {},
  menderDebPackageVersion: '',
  integrationVersion: '',
  menderVersion: '',
  menderArtifactVersion: '',
  metaMenderVersion: '',
  services: {
    deploymentsVersion: '',
    deviceauthVersion: '',
    inventoryVersion: '',
    guiVersion: ''
  },
  ...mender_environment
};

const initialState = {
  hostAddress: menderEnvironment.hostAddress,
  snackbar: {
    open: false,
    message: ''
  },
  // return boolean rather than organization details
  features: {
    hasMultitenancy: stringToBoolean(menderEnvironment.features.hasMultitenancy),
    isHosted: stringToBoolean(menderEnvironment.features.isHosted) || window.location.hostname === 'hosted.mender.io',
    isEnterprise: stringToBoolean(menderEnvironment.features.isEnterprise),
    isDemoMode: stringToBoolean(menderEnvironment.isDemoMode)
  },
  hostedAnnouncement: menderEnvironment.hostedAnnouncement,
  docsVersion: isNaN(menderEnvironment.menderVersion.charAt(0))
    ? menderEnvironment.menderVersion
        .split('.')
        .slice(0, 2)
        .join('.')
    : '',
  menderDebPackageVersion: menderEnvironment.menderDebPackageVersion || 'master',
  versionInformation: {
    Integration: isNaN(menderEnvironment.integrationVersion.charAt(0)) ? 'master' : menderEnvironment.integrationVersion,
    'Mender-Client': isNaN(menderEnvironment.menderVersion.charAt(0)) ? 'master' : menderEnvironment.menderVersion,
    'Mender-Artifact': menderEnvironment.menderArtifactVersion,
    'Meta-Mender': menderEnvironment.metaMenderVersion,
    Deployments: menderEnvironment.services.deploymentsVersion,
    Deviceauth: menderEnvironment.services.deviceauthVersion,
    Inventory: menderEnvironment.services.inventoryVersion,
    GUI: menderEnvironment.services.guiVersion || 'latest'
  }
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case AppConstants.SET_SNACKBAR:
      return {
        ...state,
        snackbar: action.snackbar
      };
    case AppConstants.RECEIVED_HOSTED_LINKS:
      return {
        ...state,
        hostedLinks: action.links
      };
    case AppConstants.SET_LOCAL_IPADDRESS:
      return {
        ...state,
        hostAddress: action.ipAddress
      };
    default:
      return state;
  }
};

export default userReducer;
