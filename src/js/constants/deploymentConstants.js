const deploymentStatesToSubstates = {
  failures: ['failure', 'aborted', 'decommissioned'],
  inprogress: ['downloading', 'installing', 'rebooting'],
  paused: ['pause_before_installing', 'pause_before_rebooting', 'pause_before_committing'],
  pending: ['pending'],
  successes: ['success', 'already-installed', 'noartifact']
};
const installationSubstatesMap = {
  download: {
    title: 'download',
    done: 'downloaded',
    successIndicators: ['installing', 'rebooting', ...deploymentStatesToSubstates.paused, 'success'],
    failureIndicators: deploymentStatesToSubstates.failures,
    pauseConfigurationIndicator: 'ArtifactInstall_Enter'
  },
  install: {
    title: 'install',
    done: 'installed',
    successIndicators: ['rebooting', 'pause_before_rebooting', 'pause_before_committing', 'success'],
    failureIndicators: [],
    pauseConfigurationIndicator: 'ArtifactReboot_Enter'
  },
  reboot: {
    title: 'reboot',
    done: 'rebooted',
    successIndicators: ['pause_before_committing', 'success'],
    failureIndicators: [],
    pauseConfigurationIndicator: 'ArtifactCommit_Enter'
  },
  commit: {
    title: 'commit',
    done: 'committed',
    successIndicators: deploymentStatesToSubstates.successes,
    failureIndicators: [],
    pauseConfigurationIndicator: undefined
  }
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
    finished: 'Finished',
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
  installationSubstatesMap,
  pauseMap: {
    pause_before_installing: { title: installationSubstatesMap.download.done, followUp: installationSubstatesMap.download.pauseConfigurationIndicator },
    pause_before_rebooting: { title: installationSubstatesMap.install.done, followUp: installationSubstatesMap.install.pauseConfigurationIndicator },
    pause_before_committing: { title: installationSubstatesMap.reboot.done, followUp: installationSubstatesMap.reboot.pauseConfigurationIndicator }
  }
};
