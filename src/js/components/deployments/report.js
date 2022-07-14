import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

// material ui
import { Button, Divider, Drawer, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceAuth, getDeviceById } from '../../actions/deviceActions';
import { getDeploymentDevices, getDeviceLog, getSingleDeployment, updateDeploymentControlMap } from '../../actions/deploymentActions';
import { getAuditLogs } from '../../actions/organizationActions';
import { getRelease } from '../../actions/releaseActions';
import { deploymentStatesToSubstates, DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import { AUDIT_LOGS_TYPES } from '../../constants/organizationConstants';
import { getIdAttribute, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import ConfigurationObject from '../common/configurationobject';
import LogDialog from '../common/dialogs/log';
import DeploymentOverview from './deployment-report/overview';
import RolloutSchedule from './deployment-report/rolloutschedule';
import { statCollector } from '../../helpers';
import Confirm from '../common/confirm';
import DeviceList from './deployment-report/devicelist';
import DeploymentStatus from './deployment-report/deploymentstatus';
import DeploymentPhaseNotification from './deployment-report/deploymentphasenotification';
import LinedHeader from '../common/lined-header';

momentDurationFormatSetup(moment);

export const defaultColumnDataProps = {
  chipLikeKey: false,
  style: { alignItems: 'center', alignSelf: 'flex-start', gridTemplateColumns: 'minmax(140px, 1fr) minmax(220px, 1fr)', maxWidth: '25vw' }
};

export const DeploymentAbortButton = ({ abort, deployment }) => {
  const [aborting, setAborting] = useState(false);

  return aborting ? (
    <Confirm cancel={() => setAborting(!aborting)} action={() => abort(deployment.id)} type="abort" />
  ) : (
    <Tooltip
      title="Devices that have not yet started the deployment will not start the deployment.&#10;Devices that have already completed the deployment are not affected by the abort.&#10;Devices that are in the middle of the deployment at the time of abort will finish deployment normally, but will perform a rollback."
      placement="bottom"
    >
      <Button color="secondary" startIcon={<BlockIcon fontSize="small" />} onClick={() => setAborting(!aborting)}>
        {deployment.filters?.length ? 'Stop' : 'Abort'} deployment
      </Button>
    </Tooltip>
  );
};

export const DeploymentReport = props => {
  const {
    abort,
    canAuditlog,
    creator,
    deployment,
    getAuditLogs,
    getDeviceLog,
    getRelease,
    getSingleDeployment,
    hasAuditlogs,
    open,
    onClose,
    past,
    retry,
    release,
    type,
    updateDeploymentControlMap
  } = props;
  const theme = useTheme();
  const [deviceId, setDeviceId] = useState('');
  const rolloutSchedule = useRef();
  const timer = useRef();

  useEffect(() => {
    if (!open) {
      return;
    }
    clearInterval(timer.current);
    if (!(deployment.finished || deployment.status === DEPLOYMENT_STATES.finished)) {
      timer.current = past ? null : setInterval(refreshDeployment, 5000);
    }
    if ((deployment.type === DEPLOYMENT_TYPES.software || !release.device_types_compatible.length) && deployment.artifact_name) {
      getRelease(deployment.artifact_name);
    }
    if (hasAuditlogs && canAuditlog) {
      getAuditLogs({
        page: 1,
        perPage: 100,
        startDate: undefined,
        endDate: undefined,
        user: undefined,
        type: AUDIT_LOGS_TYPES.find(item => item.value === 'deployment'),
        detail: deployment.name
      });
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [deployment.id, open]);

  useEffect(() => {
    const { device_count, stats = {} } = deployment;

    const progressCount =
      statCollector(deploymentStatesToSubstates.paused, stats) +
      statCollector(deploymentStatesToSubstates.pending, stats) +
      statCollector(deploymentStatesToSubstates.inprogress, stats);

    if (!!device_count && progressCount <= 0 && timer.current) {
      // if no more devices in "progress" statuses, deployment has finished, stop counter
      clearInterval(timer.current);
      timer.current = setTimeout(refreshDeployment, 1000);
      return () => {
        clearTimeout(timer.current);
      };
    }
  }, [deployment.id, deployment.stats]);

  const scrollToBottom = () => {
    rolloutSchedule.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const refreshDeployment = () => {
    if (!deployment.id) {
      return;
    }
    return getSingleDeployment(deployment.id);
  };

  const viewLog = id => getDeviceLog(deployment.id, id).then(() => setDeviceId(id));

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/deployments') + '/deployments'.length);
    copy(`${location}?open=true&id=${deployment.id}`);
    setSnackbar('Link copied to clipboard');
  };

  const { devices = {}, type: deploymentType } = deployment;
  const { log: logData } = devices[deviceId] || {};
  const finished = deployment.finished || deployment.status === DEPLOYMENT_STATES.finished;
  const isConfigurationDeployment = deploymentType === DEPLOYMENT_TYPES.configuration;
  let config = {};
  if (isConfigurationDeployment) {
    try {
      config = JSON.parse(atob(deployment.configuration));
    } catch (error) {
      config = {};
    }
  }

  const onUpdateControlChange = (updatedMap = {}) => {
    const { id, update_control_map = {} } = deployment;
    const { states } = update_control_map;
    const { states: updatedStates } = updatedMap;
    updateDeploymentControlMap(id, { states: { ...states, ...updatedStates } });
  };

  return (
    <Drawer className={`${open ? 'fadeIn' : 'fadeOut'}`} anchor="right" open={open} onClose={onClose} PaperProps={{ style: { minWidth: '75vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <div className="flexbox">
          <h3>{`Deployment ${type !== DEPLOYMENT_STATES.scheduled ? 'details' : 'report'}`}</h3>
          <h4 className="margin-left-small margin-right-small">ID: {deployment.id}</h4>
          <IconButton onClick={copyLinkToClipboard} style={{ alignSelf: 'center' }} size="large">
            <LinkIcon />
          </IconButton>
        </div>
        <div className="flexbox center-aligned">
          {!finished ? (
            <DeploymentAbortButton abort={abort} deployment={deployment} />
          ) : deployment.stats.failure || deployment.stats.aborted ? (
            <Tooltip
              title="This will create a new deployment with the same device group and Release.&#10;Devices with this Release already installed will be skipped, all others will be updated."
              placement="bottom"
            >
              <Button color="secondary" startIcon={<RefreshIcon fontSize="small" />} onClick={() => retry(deployment, Object.keys(devices))}>
                Recreate deployment?
              </Button>
            </Tooltip>
          ) : (
            <div className="flexbox centered margin-right">
              <CheckCircleOutlineIcon fontSize="small" className="green margin-right-small" />
              <h3>Finished</h3>
            </div>
          )}
          <IconButton onClick={onClose} aria-label="close" size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />
      <div>
        <DeploymentPhaseNotification deployment={deployment} onReviewClick={scrollToBottom} />
        <DeploymentOverview creator={creator} deployment={deployment} onScheduleClick={scrollToBottom} />
        {isConfigurationDeployment && (
          <>
            <LinedHeader heading="Configuration" />
            <ConfigurationObject className="margin-top-small margin-bottom-large" config={config} />
          </>
        )}
        <LinedHeader heading="Status" />
        <DeploymentStatus deployment={deployment} />
        <DeviceList {...props} viewLog={viewLog} />
        <RolloutSchedule deployment={deployment} onUpdateControlChange={onUpdateControlChange} onAbort={abort} innerRef={rolloutSchedule} />
        {Boolean(deviceId.length) && <LogDialog logData={logData} onClose={() => setDeviceId('')} />}
      </div>
      <Divider light style={{ marginTop: theme.spacing(2) }} />
    </Drawer>
  );
};

const actionCreators = {
  getAuditLogs,
  getDeploymentDevices,
  getDeviceAuth,
  getDeviceById,
  getDeviceLog,
  getRelease,
  getSingleDeployment,
  setSnackbar,
  updateDeploymentControlMap
};

const mapStateToProps = state => {
  const { devices = {} } = state.deployments.byId[state.deployments.selectionState.selectedId] || {};
  const selectedDevices = state.deployments.selectedDeviceIds.map(deviceId => ({ ...state.devices.byId[deviceId], ...devices[deviceId] }));
  const deployment = state.deployments.byId[state.deployments.selectionState.selectedId] || {};
  // we can't filter by auditlog action via the api, so
  // - fall back to the following filter
  // - hope the deployment creation event is retrieved with the call to auditlogs api on report open
  // - otherwise no creator will be shown
  const { actor = {} } =
    state.organization.auditlog.events.find(event => event.object.id === state.deployments.selectionState.selectedId && event.action === 'create') || {};
  const { hasAuditlogs } = getTenantCapabilities(state);
  const { canAuditlog } = getUserCapabilities(state);
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    canAuditlog,
    creator: actor.email,
    deployment,
    hasAuditlogs,
    idAttribute: getIdAttribute(state).attribute,
    isHosted: state.app.features.isHosted,
    release:
      deployment.artifact_name && state.releases.byId[deployment.artifact_name]
        ? state.releases.byId[deployment.artifact_name]
        : { device_types_compatible: [] },
    selectedDeviceIds: state.deployments.selectedDeviceIds,
    selectedDevices
  };
};

export default connect(mapStateToProps, actionCreators)(DeploymentReport);
