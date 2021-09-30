module.exports = {
  AUDIT_LOGS_TYPES: [
    { title: 'Deployment', queryParameter: 'object_deployment_name', value: 'deployment' },
    { title: 'Device', queryParameter: 'object_id', value: 'device' },
    { title: 'User', queryParameter: 'object_id', value: 'user' }
  ],
  RECEIVE_AUDIT_LOGS: 'RECEIVE_AUDIT_LOGS',
  RECEIVE_CURRENT_CARD: 'RECEIVE_CURRENT_CARD',
  RECEIVE_SETUP_INTENT: 'RECEIVE_SETUP_INTENT',
  SET_AUDITLOG_STATE: 'SET_AUDITLOG_STATE',
  SET_ORGANIZATION: 'SET_ORGANIZATION'
};
