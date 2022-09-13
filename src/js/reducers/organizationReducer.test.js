import reducer, { initialState } from './organizationReducer';
import OrganizationConstants from '../constants/organizationConstants';
import { defaultState } from '../../../tests/mockData';

describe('organization reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVE_AUDIT_LOGS', async () => {
    expect(
      reducer(undefined, { type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: defaultState.organization.auditlog.events, total: 2 }).auditlog
        .selectionState.total
    ).toEqual(2);
    expect(
      reducer(initialState, { type: OrganizationConstants.RECEIVE_AUDIT_LOGS, events: defaultState.organization.auditlog.events, total: 4 }).auditlog
        .selectionState.total
    ).toEqual(4);
  });
  it('should handle SET_AUDITLOG_STATE', async () => {
    const newState = { something: 'new' };
    expect(reducer(undefined, { type: OrganizationConstants.SET_AUDITLOG_STATE, state: newState }).auditlog.selectionState).toEqual(newState);
    expect(reducer(initialState, { type: OrganizationConstants.SET_AUDITLOG_STATE, state: newState }).auditlog.selectionState).toEqual(newState);
  });
  it('should handle RECEIVE_CURRENT_CARD', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_CURRENT_CARD, card: defaultState.organization.card }).card).toEqual(
      defaultState.organization.card
    );
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_CURRENT_CARD, card: defaultState.organization.card }).card).toEqual(
      defaultState.organization.card
    );
  });
  it('should handle RECEIVE_SETUP_INTENT', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_SETUP_INTENT, intentId: defaultState.organization.intentId }).intentId).toEqual(
      defaultState.organization.intentId
    );
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_SETUP_INTENT, intentId: 4 }).intentId).toEqual(4);
  });
  it('should handle SET_ORGANIZATION', async () => {
    expect(
      reducer(undefined, { type: OrganizationConstants.SET_ORGANIZATION, organization: defaultState.organization.organization }).organization.plan
    ).toEqual(defaultState.organization.organization.plan);
    expect(
      reducer(initialState, { type: OrganizationConstants.SET_ORGANIZATION, organization: defaultState.organization.organization }).organization.name
    ).toEqual(defaultState.organization.organization.name);
  });
  it('should handle RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, value: [] }).externalDeviceIntegrations).toEqual([]);
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, value: [12, 23] }).externalDeviceIntegrations).toEqual([
      12, 23
    ]);
  });
  it('should handle RECEIVE_WEBHOOK_EVENTS', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_WEBHOOK_EVENTS, value: [] }).webhooks.events).toEqual([]);
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_WEBHOOK_EVENTS, value: [12, 23], total: 5 }).webhooks).toEqual({
      events: [12, 23],
      eventsTotal: 5
    });
  });
  it('should handle RECEIVE_SAML_CONFIGS', async () => {
    expect(reducer(undefined, { type: OrganizationConstants.RECEIVE_SAML_CONFIGS, value: [] }).samlConfigs).toEqual([]);
    expect(reducer(initialState, { type: OrganizationConstants.RECEIVE_SAML_CONFIGS, value: [12, 23] }).samlConfigs).toEqual([12, 23]);
  });
});
