import { SORTING_OPTIONS } from '../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../constants/deviceConstants';
import OrganizationConstants from '../constants/organizationConstants';

export const initialState = {
  card: {
    last4: '',
    expiration: { month: 1, year: 2020 },
    brand: ''
  },
  intentId: null,
  organization: {
    // id, name, status, tenant_token, plan
  },
  auditlog: {
    events: [],
    selectionState: {
      ...DEVICE_LIST_DEFAULTS,
      detail: '',
      endDate: undefined,
      selectedIssue: undefined,
      sorting: SORTING_OPTIONS.desc,
      startDate: undefined,
      total: 0,
      type: '',
      user: ''
    }
  },
  externalDeviceIntegrations: [
    // { provider, connectionString }
  ]
};

const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case OrganizationConstants.RECEIVE_AUDIT_LOGS:
      return {
        ...state,
        auditlog: {
          ...state.auditlog,
          events: action.events,
          selectionState: {
            ...state.auditlog.selectionState,
            total: action.total
          }
        }
      };
    case OrganizationConstants.SET_AUDITLOG_STATE:
      return {
        ...state,
        auditlog: {
          ...state.auditlog,
          selectionState: action.state
        }
      };
    case OrganizationConstants.RECEIVE_CURRENT_CARD:
      return {
        ...state,
        card: action.card
      };
    case OrganizationConstants.RECEIVE_SETUP_INTENT:
      return {
        ...state,
        intentId: action.intentId
      };
    case OrganizationConstants.SET_ORGANIZATION:
      return {
        ...state,
        organization: {
          ...action.organization
        }
      };
    case OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS:
      return {
        ...state,
        externalDeviceIntegrations: action.value
      };
    default:
      return state;
  }
};

export default organizationReducer;
