import * as AppConstants from '../constants/appConstants';
import * as UserConstants from '../constants/userConstants';

const getYesterday = () => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  return today.toISOString();
};

export const initialState = {
  cancelSource: undefined,
  demoArtifactLink: 'https://dgsbl4vditpls.cloudfront.net/mender-demo-artifact.mender',
  hostAddress: null,
  snackbar: {
    open: false,
    message: ''
  },
  // return boolean rather than organization details
  features: {
    hasAddons: false,
    hasAuditlogs: false,
    hasDeltaProgress: false,
    hasMultitenancy: false,
    hasDeviceConfig: false,
    hasDeviceConnect: false,
    hasMonitor: false,
    hasReleaseTags: false,
    hasReporting: false,
    isDemoMode: false,
    isHosted: false,
    isEnterprise: false
  },
  firstLoginAfterSignup: false,
  hostedAnnouncement: '',
  docsVersion: '',
  recaptchaSiteKey: '',
  searchState: {
    deviceIds: [],
    searchTerm: '',
    searchTotal: 0,
    sort: {
      direction: AppConstants.SORTING_OPTIONS.desc
      // key: null,
      // scope: null
    }
  },
  stripeAPIKey: '',
  trackerCode: '',
  uploadsById: {
    // id: { uploading: false, uploadProgress: 0, cancelSource: undefined }
  },
  offlineThreshold: getYesterday(),
  versionInformation: {
    Integration: '',
    'Mender-Client': '',
    'Mender-Artifact': '',
    'Meta-Mender': '',
    Deployments: '',
    Deviceauth: '',
    Inventory: '',
    GUI: 'latest'
  },
  yesterday: undefined
};

// exclude 'pendings-redirect' since this is expected to persist refreshes - the rest should be better to be redone
const keys = ['sessionDeploymentChecker', UserConstants.settingsKeys.initialized];
const resetEnvironment = () => {
  keys.map(key => window.sessionStorage.removeItem(key));
};

resetEnvironment();

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case AppConstants.SET_FEATURES:
      return {
        ...state,
        features: {
          ...state.features,
          ...action.value
        }
      };
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
    case AppConstants.SET_SEARCH_STATE:
      return {
        ...state,
        searchState: action.state
      };
    case AppConstants.SET_OFFLINE_THRESHOLD:
      return {
        ...state,
        offlineThreshold: action.value
      };
    case AppConstants.UPLOAD_PROGRESS:
      return {
        ...state,
        uploadsById: action.uploads
      };
    case AppConstants.SET_VERSION_INFORMATION:
      return {
        ...state,
        docsVersion: action.docsVersion,
        versionInformation: action.value
      };
    case AppConstants.SET_ENVIRONMENT_DATA:
      return {
        ...state,
        ...action.value
      };
    default:
      return state;
  }
};

export default appReducer;
