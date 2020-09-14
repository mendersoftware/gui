import * as OrganizationConstants from '../constants/organizationConstants';

export const initialState = {
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
          'application/json': {
            name: 'production',
            artifact_name: 'Application 0.0.1'
          }
        }
      },
      change: 'change2'
    }
  ],
  eventsTotal: 2
};

const organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case OrganizationConstants.RECEIVE_AUDIT_LOGS:
      return {
        ...state,
        events: action.events,
        eventsTotal: action.total
      };
    default:
      return state;
  }
};

export default organizationReducer;
