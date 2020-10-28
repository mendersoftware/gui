import OrganizationConstants from '../constants/organizationConstants';

export const initialState = {
  card: {
    last4: '',
    expiration: { month: 1, year: 2020 },
    brand: ''
  },
  events: [],
  eventsTotal: 2,
  intentId: null,
  organization: {
    // id, name, status, tenant_token, plan
  }
};

const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case OrganizationConstants.RECEIVE_AUDIT_LOGS:
      return {
        ...state,
        events: action.events,
        eventsTotal: action.total
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
    default:
      return state;
  }
};

export default organizationReducer;
