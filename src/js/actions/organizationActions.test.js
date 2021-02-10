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
  getAuditLogs,
  getAuditLogsCsvLink,
  getCurrentCard,
  getUserOrganization,
  sendSupportMessage,
  startCardUpdate,
  startUpgrade
} from './organizationActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('organization actions', () => {
  it('should handle different error message formats', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Deactivation request was sent successfully'
        }
      }
    ];
    await store.dispatch(cancelRequest(defaultState.organization.organization.id, 'testReason')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle trial creation', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [];
    await store
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

  it('should handle credit card details retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.RECEIVE_CURRENT_CARD,
        card: defaultState.organization.card
      }
    ];
    await store.dispatch(getCurrentCard()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle organization retrieval', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: OrganizationConstants.SET_ORGANIZATION,
        organization: defaultState.organization.organization
      }
    ];
    await store.dispatch(getUserOrganization()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle support request sending', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        type: AppConstants.SET_SNACKBAR,
        snackbar: {
          message: 'Your request was sent successfully'
        }
      }
    ];
    await store.dispatch(sendSupportMessage({ body: 'test', subject: 'testsubject' })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle account upgrade init', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(startUpgrade(defaultState.organization.organization.id)).then(secret => {
      expect(store.getActions()).toHaveLength(0);
      expect(secret).toEqual('testSecret');
    });
  });

  it('should handle account upgrade cancelling', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(cancelUpgrade(defaultState.organization.organization.id)).then(() => expect(store.getActions()).toHaveLength(0));
  });

  it('should handle account upgrade completion', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        organization: defaultState.organization.organization,
        type: OrganizationConstants.SET_ORGANIZATION
      }
    ];
    await store.dispatch(completeUpgrade(defaultState.organization.organization.id, 'enterprise')).then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle confirm card update initialization', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const expectedActions = [
      {
        intentId: 'testIntent',
        type: OrganizationConstants.RECEIVE_SETUP_INTENT
      }
    ];
    await store.dispatch(startCardUpdate()).then(secret => {
      const storeActions = store.getActions();
      expect(secret).toEqual('testSecret');
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle confirm card update confirmation', async () => {
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
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);

      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle auditlog retrieval', async () => {
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
    await request.then(() => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });

  it('should handle csv information download', async () => {
    const store = mockStore({ ...defaultState });
    expect(store.getActions()).toHaveLength(0);
    const request = store.dispatch(getAuditLogsCsvLink());
    expect(request).resolves.toBeTruthy();
    await request.then(link => {
      const storeActions = store.getActions();
      expect(storeActions).toHaveLength(0);
      expect(link).toEqual('/api/management/v1/auditlogs/logs/export?limit=20000&sort=desc');
    });
  });
});
