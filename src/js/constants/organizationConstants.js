import { EXTERNAL_PROVIDER } from './deviceConstants';

export const AUDIT_LOGS_TYPES = [
  { title: 'Deployment', queryParameter: 'object_deployment_name', value: 'deployment' },
  { title: 'Device', queryParameter: 'object_id', value: 'device' },
  { title: 'User', queryParameter: 'object_id', value: 'user' }
];
export const RECEIVE_AUDIT_LOGS = 'RECEIVE_AUDIT_LOGS';
export const RECEIVE_CURRENT_CARD = 'RECEIVE_CURRENT_CARD';
export const RECEIVE_SETUP_INTENT = 'RECEIVE_SETUP_INTENT';
export const SET_AUDITLOG_STATE = 'SET_AUDITLOG_STATE';
export const SET_ORGANIZATION = 'SET_ORGANIZATION';
export const RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS = 'RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS';
export const RECEIVE_SAML_CONFIGS = 'RECEIVE_SAML_CONFIGS';
export const RECEIVE_WEBHOOK_EVENTS = 'RECEIVE_WEBHOOK_EVENTS';
export const emptyWebhook = {
  description: '',
  enabled: true,
  credentials: {
    type: EXTERNAL_PROVIDER.webhook.credentialsType,
    [EXTERNAL_PROVIDER.webhook.credentialsType]: {
      secret: '',
      url: ''
    }
  }
};
