const deploymentStatesToSubstates = {
  failures: ['failure', 'aborted', 'decommissioned'],
  inprogress: ['downloading', 'installing', 'rebooting'],
  paused: ['pause_before_installing', 'pause_before_rebooting', 'pause_before_committing'],
  pending: ['pending'],
  successes: ['success', 'already-installed', 'noartifact']
};

module.exports = {
  CREATE_DEPLOYMENT: 'CREATE_DEPLOYMENT',
  REMOVE_DEPLOYMENT: 'REMOVE_DEPLOYMENT',
  RECEIVE_DEPLOYMENT: 'RECEIVE_DEPLOYMENT',
  RECEIVE_DEPLOYMENT_STATS: 'RECEIVE_DEPLOYMENT_STATS',
  RECEIVE_DEPLOYMENT_DEVICE_LOG: 'RECEIVE_DEPLOYMENT_DEVICE_LOG',
  RECEIVE_DEPLOYMENTS: 'RECEIVE_DEPLOYMENTS',
  RECEIVE_PENDING_DEPLOYMENTS: 'RECEIVE_PENDING_DEPLOYMENTS',
  RECEIVE_INPROGRESS_DEPLOYMENTS: 'RECEIVE_INPROGRESS_DEPLOYMENTS',
  RECEIVE_SCHEDULED_DEPLOYMENTS: 'RECEIVE_SCHEDULED_DEPLOYMENTS',
  RECEIVE_FINISHED_DEPLOYMENTS: 'RECEIVE_FINISHED_DEPLOYMENTS',
  SELECT_INPROGRESS_DEPLOYMENTS: 'SELECT_INPROGRESS_DEPLOYMENTS',
  SELECT_PENDING_DEPLOYMENTS: 'SELECT_PENDING_DEPLOYMENTS',
  SELECT_SCHEDULED_DEPLOYMENTS: 'SELECT_SCHEDULED_DEPLOYMENTS',
  SELECT_FINISHED_DEPLOYMENTS: 'SELECT_FINISHED_DEPLOYMENTS',
  SELECT_DEPLOYMENT: 'SELECT_DEPLOYMENT',
  DEPLOYMENT_STATES: {
    finished: 'finished',
    inprogress: 'inprogress',
    pending: 'pending',
    scheduled: 'scheduled'
  },
  DEPLOYMENT_TYPES: {
    software: 'software',
    configuration: 'configuration'
  },
  defaultStats: {
    aborted: 0,
    'already-installed': 0,
    decommissioned: 0,
    downloading: 0,
    failure: 0,
    installing: 0,
    noartifact: 0,
    pause_before_committing: 0,
    pause_before_installing: 0,
    pause_before_rebooting: 0,
    pending: 0,
    rebooting: 0,
    success: 0
  },
  deploymentDisplayStates: {
    scheduled: 'Scheduled',
    skipped: 'Skipped',
    paused: 'Paused',
    pending: 'Pending',
    inprogress: 'In Progress',
    success: 'Success',
    successes: 'Success',
    failure: 'Fail',
    failures: 'Fail'
  },
  deploymentStatesToSubstates,
  deploymentStatesToSubstatesWithSkipped: {
    inprogress: deploymentStatesToSubstates.inprogress,
    paused: deploymentStatesToSubstates.paused,
    failures: ['failure'],
    skipped: ['aborted', 'noartifact', 'already-installed', 'decommissioned'],
    pending: ['pending'],
    successes: ['success']
  },
  deploymentPrototype: {
    devices: {},
    name: undefined,
    stats: {}
  },
  pauseMap: {
    pause_before_installing: { title: 'downloaded', followUp: 'ArtifactInstall_Enter' },
    pause_before_rebooting: { title: 'installed', followUp: 'ArtifactReboot_Enter' },
    pause_before_committing: { title: 'rebooted', followUp: 'ArtifactCommit_Enter' }
  }
};
