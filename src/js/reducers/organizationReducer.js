import * as OrganizationConstants from '../constants/organizationConstants';

export const initialState = {
  events: [],
  eventsTotal: 2,
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
