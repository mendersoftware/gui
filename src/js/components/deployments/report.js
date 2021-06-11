import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

// material ui
import { Button, Divider, Drawer, IconButton, Tooltip } from '@material-ui/core';
import {
  Block as BlockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon
} from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { getDeviceAuth, getDeviceById } from '../../actions/deviceActions';
import { getDeviceLog, getSingleDeployment } from '../../actions/deploymentActions';
import { getAuditLogs } from '../../actions/organizationActions';
import { getRelease } from '../../actions/releaseActions';
import { DEPLOYMENT_STATES, DEPLOYMENT_TYPES } from '../../constants/deploymentConstants';
import { getIdAttribute, getIsEnterprise } from '../../selectors';
import theme from '../../themes/mender-theme';
import ConfigurationObject from '../common/configurationobject';
import LogDialog from '../common/dialogs/log';
import DeploymentOverview from './deployment-report/overview';
import RolloutSchedule from './deployment-report/rolloutschedule';
import { sortDeploymentDevices } from '../../helpers';
import Confirm from '../common/confirm';
import DeviceList from './deployment-report/devicelist';
import DeploymentStatus from './deployment-report/deploymentstatus';

momentDurationFormatSetup(moment);

let timer;

export const defaultColumnDataProps = {
  chipLikeKey: false,
  style: { alignItems: 'center', alignSelf: 'flex-start', gridTemplateColumns: 'minmax(140px, 1fr) minmax(220px, 1fr)' }
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
  const [deviceId, setDeviceId] = useState();
  const rolloutSchedule = useRef();
  const {
    abort,
    allDevices,
    deployment,
    getAuditLogs,
    getDeviceLog,
    getRelease,
    getSingleDeployment,
    isEnterprise,
    open,
    onClose,
    past,
    retry,
    release,
    type
  } = props;

  useEffect(() => {
    if (!open) {
      return;
    }
    clearInterval(timer);
    if (!(deployment.finished || deployment.status === DEPLOYMENT_STATES.finished)) {
      timer = past ? null : setInterval(refreshDeploymentDevices, 5000);
    }
    if (deployment.type === DEPLOYMENT_TYPES.software || !release.device_types_compatible.length) {
      getRelease(deployment.artifact_name);
    }
    if (isEnterprise) {
      getAuditLogs(1, 100, undefined, undefined, undefined, 'deployment', deployment.name);
    }
    refreshDeploymentDevices();
    return () => {
      clearInterval(timer);
    };
  }, [open]);

  useEffect(() => {
    const { device_count, stats } = deployment;
    if (device_count && stats && stats.downloading + stats.installing + stats.rebooting + stats.pending <= 0) {
      // if no more devices in "progress" statuses, deployment has finished, stop counter
      clearInterval(timer);
    }
  }, [deployment.id, deployment.stats]);

  const scrollToBottom = () => {
    rolloutSchedule.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const refreshDeploymentDevices = () => {
    if (!deployment.id) {
      return;
    }
    return getSingleDeployment(deployment.id);
  };

  const viewLog = id =>
    getDeviceLog(deployment.id, id).then(() => {
      setDeviceId(id);
    });

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/deployments') + '/deployments'.length);
    copy(`${location}?open=true&id=${deployment.id}`);
    setSnackbar('Link copied to clipboard');
  };

  const { created = new Date().toISOString(), devices, type: deploymentType } = deployment;
  const logData = deviceId && devices[deviceId] ? devices[deviceId].log : null;
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

  return (
    <Drawer className={`${open ? 'fadeIn' : 'fadeOut'}`} anchor="right" open={open} onClose={onClose} PaperProps={{ style: { minWidth: '75vw' } }}>
      <div className="flexbox margin-bottom-small space-between">
        <div className="flexbox">
          <h3>{`Deployment ${type !== DEPLOYMENT_STATES.scheduled ? 'details' : 'report'}`}</h3>
          <h4 className="margin-left-small margin-right-small">ID: {deployment.id}</h4>
          <IconButton onClick={copyLinkToClipboard} style={{ alignSelf: 'center' }}>
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
              <Button color="secondary" startIcon={<RefreshIcon fontSize="small" />} onClick={() => retry(deployment, Object.values(allDevices))}>
                Recreate deployment?
              </Button>
            </Tooltip>
          ) : (
            <div className="flexbox centered margin-right">
              <CheckCircleOutlineIcon fontSize="small" className="green margin-right-small" />
              <h3>Finished</h3>
            </div>
          )}
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <Divider />
      <div className="deployment-report">
        <DeploymentOverview {...props} onScheduleClick={scrollToBottom} />

        {isConfigurationDeployment && (
          <>
            <h4 className="dashboard-header">
              <span>Configuration</span>
            </h4>
            <ConfigurationObject className="margin-top-small margin-bottom-large" config={config} />
          </>
        )}

        <h4 className="dashboard-header">
          <span>Status</span>
        </h4>
        <DeploymentStatus deployment={deployment} />
        <DeviceList {...props} created={created} viewLog={viewLog} />
        <RolloutSchedule deployment={deployment} innerRef={rolloutSchedule} />
        {deviceId && <LogDialog logData={logData} onClose={() => setDeviceId()} />}
      </div>
      <Divider light style={{ marginTop: theme.spacing(2) }} />
    </Drawer>
  );
};

const actionCreators = { getAuditLogs, getDeviceAuth, getDeviceById, getDeviceLog, getRelease, getSingleDeployment, setSnackbar };

const mapStateToProps = state => {
  const devices = state.deployments.byId[state.deployments.selectedDeployment]?.devices || {};
  const allDevices = sortDeploymentDevices(Object.values(devices)).map(device => ({ ...state.devices.byId[device.id], ...device }));
  const deployment = state.deployments.byId[state.deployments.selectedDeployment] || {};
  const { actor = {} } = state.organization.events.find(event => event.object.id === state.deployments.selectedDeployment) || {};
  return {
    acceptedDevicesCount: state.devices.byStatus.accepted.total,
    allDevices,
    creator: actor.email,
    deviceCount: allDevices.length,
    devicesById: state.devices.byId,
    deployment,
    idAttribute: getIdAttribute(state),
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    release:
      deployment.artifact_name && state.releases.byId[deployment.artifact_name]
        ? state.releases.byId[deployment.artifact_name]
        : { device_types_compatible: [] }
  };
};

export default connect(mapStateToProps, actionCreators)(DeploymentReport);
