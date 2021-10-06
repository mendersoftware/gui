import * as AppConstants from '../constants/appConstants';
import { stringToBoolean } from '../helpers';

const menderEnvironment = {
  hostAddress: null,
  features: {
    hasAddons: false,
    hasAuditlogs: false,
    hasMultitenancy: false,
    isHosted: false,
    isEnterprise: false,
    isDemoMode: false
  },
  docsVersion: '',
  hostedAnnouncement: '',
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
  recaptchaSiteKey: '',
  stripeAPIKey: '',
  trackerCode: '',
  ...mender_environment
};

const getComparisonCompatibleVersion = version => (isNaN(version.charAt(0)) && version !== 'next' ? 'master' : version);

export const initialState = {
  cancelSource: undefined,
  demoArtifactLink: 'https://dgsbl4vditpls.cloudfront.net/mender-demo-artifact.mender',
  hostAddress: menderEnvironment.hostAddress,
  snackbar: {
    open: false,
    message: ''
  },
  // return boolean rather than organization details
  features: {
    hasAddons: stringToBoolean(menderEnvironment.features.hasAddons),
    hasAuditlogs: stringToBoolean(menderEnvironment.features.hasAuditlogs),
    hasMultitenancy: stringToBoolean(menderEnvironment.features.hasMultitenancy),
    hasDeviceConfig: stringToBoolean(menderEnvironment.features.hasDeviceConfig),
    hasDeviceConnect: stringToBoolean(menderEnvironment.features.hasDeviceConnect),
    hasMonitor: stringToBoolean(menderEnvironment.features.hasMonitor),
    hasReporting: stringToBoolean(menderEnvironment.features.hasReporting),
    isHosted: stringToBoolean(menderEnvironment.features.isHosted) || window.location.hostname.includes('hosted.mender.io'),
    isEnterprise: stringToBoolean(menderEnvironment.features.isEnterprise),
    isDemoMode: stringToBoolean(menderEnvironment.isDemoMode)
  },
  firstLoginAfterSignup: false,
  hostedAnnouncement: menderEnvironment.hostedAnnouncement,
  docsVersion: isNaN(menderEnvironment.integrationVersion.charAt(0)) ? '' : menderEnvironment.integrationVersion.split('.').slice(0, 2).join('.'),
  recaptchaSiteKey: menderEnvironment.recaptchaSiteKey,
  stripeAPIKey: menderEnvironment.stripeAPIKey,
  trackerCode: menderEnvironment.trackerCode,
  uploading: false,
  uploadProgress: 0,
  versionInformation: {
    Integration: getComparisonCompatibleVersion(menderEnvironment.integrationVersion),
    'Mender-Client': getComparisonCompatibleVersion(menderEnvironment.menderVersion),
    'Mender-Artifact': menderEnvironment.menderArtifactVersion,
    'Meta-Mender': menderEnvironment.metaMenderVersion,
    Deployments: menderEnvironment.services.deploymentsVersion,
    Deviceauth: menderEnvironment.services.deviceauthVersion,
    Inventory: menderEnvironment.services.inventoryVersion,
    GUI: menderEnvironment.services.guiVersion || 'latest'
  },
  yesterday: undefined
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case AppConstants.SET_SNACKBAR:
      return {
        ...state,
        snackbar: action.snackbar
      };
    case AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP:
      return {
        ...state,
        firstLoginAfterSignup: action.firstLoginAfterSignup
      };
    case AppConstants.SET_ANNOUNCEMENT:
      return {
        ...state,
        hostedAnnouncement: action.announcement
      };
    case AppConstants.SET_YESTERDAY:
      return {
        ...state,
        yesterday: action.value
      };
    case AppConstants.UPLOAD_PROGRESS: {
      const cancelSource = action.inprogress ? action.cancelSource || state.cancelSource : undefined;
      return {
        ...state,
        cancelSource,
        uploading: action.inprogress,
        uploadProgress: action.uploadProgress
      };
    }
    default:
      return state;
  }
};

export default appReducer;
