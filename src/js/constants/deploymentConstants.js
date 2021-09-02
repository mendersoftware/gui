const alreadyInstalled = 'already-installed';

const deploymentSubstates = {
  aborted: 'aborted',
  alreadyInstalled,
  decommissioned: 'decommissioned',
  downloading: 'downloading',
  failure: 'failure',
  installing: 'installing',
  noartifact: 'noartifact',
  pause_before_committing: 'pause_before_committing',
  pause_before_installing: 'pause_before_installing',
  pause_before_rebooting: 'pause_before_rebooting',
  pending: 'pending',
  rebooting: 'rebooting',
  success: 'success'
};

const deploymentStatesToSubstates = {
  failures: [deploymentSubstates.failure, deploymentSubstates.aborted, deploymentSubstates.decommissioned],
  inprogress: [deploymentSubstates.downloading, deploymentSubstates.installing, deploymentSubstates.rebooting],
  paused: [deploymentSubstates.pause_before_installing, deploymentSubstates.pause_before_rebooting, deploymentSubstates.pause_before_committing],
  pending: [deploymentSubstates.pending],
  successes: [deploymentSubstates.success, deploymentSubstates.alreadyInstalled, deploymentSubstates.noartifact]
};
const installationSubstatesMap = {
  download: {
    title: 'download',
    done: 'downloaded',
    successIndicators: [deploymentSubstates.installing, deploymentSubstates.rebooting, ...deploymentStatesToSubstates.paused, deploymentSubstates.success],
    failureIndicators: deploymentStatesToSubstates.failures,
    pauseConfigurationIndicator: 'ArtifactInstall_Enter'
  },
  install: {
    title: 'install',
    done: 'installed',
    successIndicators: [
      deploymentSubstates.rebooting,
      deploymentSubstates.pause_before_rebooting,
      deploymentSubstates.pause_before_committing,
      deploymentSubstates.success
    ],
    failureIndicators: deploymentStatesToSubstates.failures,
    pauseConfigurationIndicator: 'ArtifactReboot_Enter'
  },
  reboot: {
    title: 'reboot',
    done: 'rebooted',
    successIndicators: [deploymentSubstates.pause_before_committing, deploymentSubstates.success],
    failureIndicators: deploymentStatesToSubstates.failures,
    pauseConfigurationIndicator: 'ArtifactCommit_Enter'
  },
  commit: {
    title: 'commit',
    done: 'committed',
    successIndicators: deploymentStatesToSubstates.successes,
    failureIndicators: deploymentStatesToSubstates.failures,
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
    [deploymentSubstates.aborted]: 0,
    [deploymentSubstates.alreadyInstalled]: 0,
    [deploymentSubstates.decommissioned]: 0,
    [deploymentSubstates.downloading]: 0,
    [deploymentSubstates.failure]: 0,
    [deploymentSubstates.installing]: 0,
    [deploymentSubstates.noartifact]: 0,
    [deploymentSubstates.pause_before_committing]: 0,
    [deploymentSubstates.pause_before_installing]: 0,
    [deploymentSubstates.pause_before_rebooting]: 0,
    [deploymentSubstates.pending]: 0,
    [deploymentSubstates.rebooting]: 0,
    [deploymentSubstates.success]: 0
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
    failures: [deploymentSubstates.failure],
    skipped: [deploymentSubstates.aborted, deploymentSubstates.noartifact, deploymentSubstates.alreadyInstalled, deploymentSubstates.decommissioned],
    pending: [deploymentSubstates.pending],
    successes: [deploymentSubstates.success]
  },
  deploymentSubstates,
  deploymentPrototype: {
    devices: {},
    name: undefined,
    stats: {}
  },
  installationSubstatesMap,
  pauseMap: {
    [deploymentSubstates.pause_before_installing]: {
      title: installationSubstatesMap.download.done,
      followUp: installationSubstatesMap.download.pauseConfigurationIndicator
    },
    [deploymentSubstates.pause_before_rebooting]: {
      title: installationSubstatesMap.install.done,
      followUp: installationSubstatesMap.install.pauseConfigurationIndicator
    },
    [deploymentSubstates.pause_before_committing]: {
      title: installationSubstatesMap.reboot.done,
      followUp: installationSubstatesMap.reboot.pauseConfigurationIndicator
    }
  }
};
