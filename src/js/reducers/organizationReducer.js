import { SORTING_OPTIONS } from '../constants/appConstants';
import { DEVICE_LIST_DEFAULTS } from '../constants/deviceConstants';
import {
  RECEIVE_AUDIT_LOGS,
  RECEIVE_CURRENT_CARD,
  RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS,
  RECEIVE_SAML_CONFIGS,
  RECEIVE_SETUP_INTENT,
  RECEIVE_WEBHOOK_EVENTS,
  SET_AUDITLOG_STATE,
  SET_ORGANIZATION
} from '../constants/organizationConstants';

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
      reset: false,
      selectedIssue: undefined,
      sort: { direction: SORTING_OPTIONS.desc },
      startDate: undefined,
      total: 0,
      type: '',
      user: ''
    }
  },
  externalDeviceIntegrations: [
    // { <connection_string|x509|...>, id, provider }
  ],
  samlConfigs: [],
  webhooks: {
    // [id]: { events: [] }
    // for now:
    events: [],
    eventsTotal: 0
  }
};

const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_AUDIT_LOGS:
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
    case SET_AUDITLOG_STATE:
      return {
        ...state,
        auditlog: {
          ...state.auditlog,
          selectionState: action.state
        }
      };
    case RECEIVE_CURRENT_CARD:
      return {
        ...state,
        card: action.card
      };
    case RECEIVE_SETUP_INTENT:
      return {
        ...state,
        intentId: action.intentId
      };
    case SET_ORGANIZATION:
      return {
        ...state,
        organization: {
          ...action.organization
        }
      };
    case RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS:
      return {
        ...state,
        externalDeviceIntegrations: action.value
      };
    case RECEIVE_SAML_CONFIGS:
      return {
        ...state,
        samlConfigs: action.value
      };
    case RECEIVE_WEBHOOK_EVENTS:
      return {
        ...state,
        webhooks: {
          ...state.webhooks,
          events: action.value,
          eventsTotal: action.total
        }
      };
    default:
      return state;
  }
};

export default organizationReducer;
