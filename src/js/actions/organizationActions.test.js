import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import AppConstants from '../constants/appConstants';
import OrganizationConstants from '../constants/organizationConstants';
import {
  cancelRequest,
  cancelUpgrade,
  confirmCardUpdate,
  completeUpgrade,
  createOrganizationTrial,
  getAllAuditLogs,
  getAuditLogs,
  getCurrentCard,
  getUserOrganization,
  startCardUpdate,
  startUpgrade
} from './organizationActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('cancelRequest', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Deactivation request was sent successfully'
        }
      }
    ];
    store.dispatch(cancelRequest(defaultState.organization.organization.id, 'testReason')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('createOrganizationTrial', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [];
    store
      .dispatch(
        createOrganizationTrial({
          email: 'test@test.com',
          organization: 'test',
          plan: 'os',
          tos: true,
          marketing: true,
          'g-recaptcha-response': 'test'
        })
      )
      .then(token => {
        expect(token).toBeTruthy();
        expect(store.getActions()).toHaveLength(expectedActions.length);
      });
  });
});

describe('getCurrentCard', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_CURRENT_CARD,
        card: defaultState.organization.card
      }
    ];
    store.dispatch(getCurrentCard()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('getUserOrganization', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.SET_ORGANIZATION,
        organization: defaultState.organization.organization
      }
    ];
    store.dispatch(getUserOrganization()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('startUpgrade', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(startUpgrade(defaultState.organization.organization.id)).then(secret => {
      expect(store.getActions()).toHaveLength(0);
      expect(secret).toEqual('testSecret');
    });
  });
});

describe('cancelUpgrade', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(cancelUpgrade(defaultState.organization.organization.id)).then(() => expect(store.getActions()).toHaveLength(0));
  });
});

describe('completeUpgrade', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    store.dispatch(completeUpgrade(defaultState.organization.organization.id, 'enterprise')).then(() => expect(store.getActions()).toHaveLength(0));
  });
});

describe('startCardUpdate', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        intentId: 'testIntent',
        type: OrganizationConstants.RECEIVE_SETUP_INTENT
      }
    ];
    store.dispatch(startCardUpdate()).then(secret => {
      const storeActions = store.getActions();
      expect(secret).toEqual('testSecret');
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('confirmCardUpdate', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Payment card was updated successfully'
        }
      },
      {
        type: OrganizationConstants.RECEIVE_SETUP_INTENT,
        intentId: null
      }
    ];
    const request = store.dispatch(confirmCardUpdate());
    expect(request).resolves.toBeTruthy();
    request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);

      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('getAuditLogs', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_AUDIT_LOGS,
        events: defaultState.organization.events,
        total: defaultState.organization.eventsTotal
      }
    ];
    const request = store.dispatch(getAuditLogs());
    expect(request).resolves.toBeTruthy();
    request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});

describe('getAllAuditLogs', () => {
  it('should handle different error message formats', () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const request = store.dispatch(getAllAuditLogs());
    expect(request).resolves.toBeTruthy();
    request.then(events => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(0);
      expect(events).toHaveLength(defaultState.organization.events.length);
    });
  });
});
