import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import { Button, Divider, Drawer, IconButton } from '@material-ui/core';
import { Close as CloseIcon, Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, getDeviceLog, getSingleDeployment } from '../../actions/deploymentActions';
import {
  applyDeviceConfig,
  decommissionDevice,
  getDeviceInfo,
  getDeviceTwin,
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin
} from '../../actions/deviceActions';
import { getDeviceAlerts } from '../../actions/monitorActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import ForwardingLink from '../common/forwardlink';
import RelativeTime from '../common/relative-time';
import { getDocsVersion, getIsEnterprise, getTenantCapabilities, getUserRoles } from '../../selectors';
import theme from '../../themes/mender-theme';
import Tracking from '../../tracking';
import TroubleshootDialog from './troubleshootdialog';
import AuthStatus from './device-details/authstatus';
import DeviceConfiguration from './device-details/configuration';
import DeviceInventory from './device-details/deviceinventory';
import DeviceTags from './device-details/devicetags';
import DeviceIdentity from './device-details/identity';
import DeviceConnection from './device-details/connection';
import InstalledSoftware from './device-details/installedsoftware';
import DeviceMonitoring from './device-details/monitoring';
import MonitorDetailsDialog from './device-details/monitordetailsdialog';
import DeviceNotifications from './device-details/notifications';
import DeviceTwin from './device-details/devicetwin';

const refreshDeviceLength = 10000;

export const ExpandedDevice = ({
  abortDeployment,
  applyDeviceConfig,
  alerts,
  decommissionDevice,
  defaultConfig,
  device,
  deviceConfigDeployment,
  docsVersion,
  getDeviceAlerts,
  getDeviceLog,
  getDeviceInfo,
  getDeviceTwin,
  getSingleDeployment,
  integrations,
  isEnterprise,
  latestAlerts,
  onClose,
  open,
  refreshDevices,
  saveGlobalSettings,
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar,
  showHelptips,
  tenantCapabilities,
  userRoles
}) => {
  const { isOffline, status = DEVICE_STATES.accepted } = device;
  const [socketClosed, setSocketClosed] = useState(true);
  const [troubleshootType, setTroubleshootType] = useState();
  const [monitorDetails, setMonitorDetails] = useState();
  const monitoring = useRef();
  const timer = useRef();

  const { hasAuditlogs, hasDeviceConfig, hasDeviceConnect, hasMonitor } = tenantCapabilities;

  useEffect(() => {
    if (!device.id) {
      return;
    }
    clearInterval(timer.current);
    timer.current = setInterval(() => getDeviceInfo(device.id), refreshDeviceLength);
    getDeviceInfo(device.id);
    return () => {
      clearInterval(timer.current);
    };
  }, [device.id, device.status]);

  const onDecommissionDevice = device_id => {
    // close dialog!
    // close expanded device
    // trigger reset of list!
    return decommissionDevice(device_id).finally(() => {
      refreshDevices();
      onClose();
    });
  };

  const launchTroubleshoot = type => {
    Tracking.event({ category: 'devices', action: 'open_terminal' });
    setSocketClosed(false);
    setTroubleshootType(type);
  };

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${device.id}`);
    setSnackbar('Link copied to clipboard');
  };

  const scrollToMonitor = () => monitoring.current?.scrollIntoView({ behavior: 'smooth' });

  const deviceIdentifier = device?.attributes?.name ?? device?.id ?? '-';
  const isAcceptedDevice = status === DEVICE_STATES.accepted;
  return (
    <Drawer anchor="right" className="expandedDevice" open={open} onClose={onClose} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox center-aligned">
        <h3>Device information for {deviceIdentifier}</h3>
        <IconButton onClick={copyLinkToClipboard}>
          <LinkIcon />
        </IconButton>
        <div className={`${isOffline ? 'red' : 'muted'} margin-left margin-right`}>
          Last check-in: <RelativeTime updateTime={device.updated_ts} />
        </div>
        <IconButton style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </div>
      <DeviceNotifications alerts={latestAlerts} device={device} isOffline={isOffline} onClick={scrollToMonitor} />
      <Divider style={{ marginBottom: theme.spacing(3), marginTop: theme.spacing(2) }} />
      <DeviceIdentity device={device} setSnackbar={setSnackbar} />
      <AuthStatus
        device={device}
        decommission={onDecommissionDevice}
        deviceListRefresh={refreshDevices}
        disableBottomBorder={!isAcceptedDevice}
        showHelptips={showHelptips}
      />
      <DeviceTags device={device} setSnackbar={setSnackbar} setDeviceTags={setDeviceTags} showHelptips={showHelptips} />
      {!!integrations.length && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status) && (
        <DeviceTwin device={device} integrations={integrations} getDeviceTwin={getDeviceTwin} setDeviceTwin={setDeviceTwin} />
      )}
      {isAcceptedDevice && (
        <>
          <InstalledSoftware device={device} docsVersion={docsVersion} setSnackbar={setSnackbar} />
          <DeviceInventory device={device} docsVersion={docsVersion} setSnackbar={setSnackbar} />
        </>
      )}
      {hasDeviceConfig && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status) && (
        <DeviceConfiguration
          abortDeployment={abortDeployment}
          applyDeviceConfig={applyDeviceConfig}
          defaultConfig={defaultConfig}
          deployment={deviceConfigDeployment}
          device={device}
          getDeviceLog={getDeviceLog}
          getSingleDeployment={getSingleDeployment}
          saveGlobalSettings={saveGlobalSettings}
          setSnackbar={setSnackbar}
          setDeviceConfig={setDeviceConfig}
          showHelptips={showHelptips}
        />
      )}
      {isAcceptedDevice && hasMonitor && (
        <DeviceMonitoring
          alerts={alerts}
          device={device}
          docsVersion={docsVersion}
          getAlerts={getDeviceAlerts}
          innerRef={monitoring}
          isOffline={isOffline}
          latestAlerts={latestAlerts}
          onDetailsClick={setMonitorDetails}
        />
      )}
      {isAcceptedDevice && hasDeviceConnect && (
        <DeviceConnection
          device={device}
          docsVersion={docsVersion}
          hasAuditlogs={hasAuditlogs}
          socketClosed={socketClosed}
          startTroubleshoot={launchTroubleshoot}
          style={{ marginRight: theme.spacing(2) }}
          userRoles={userRoles}
        />
      )}
      <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(2) }} />
      {isAcceptedDevice && (
        <div className="flexbox center-aligned">
          <Button to={`/deployments?open=true&deviceId=${device.id}`} component={ForwardingLink} startIcon={<ReplayIcon />}>
            Create a deployment for this device
          </Button>
        </div>
      )}

      <TroubleshootDialog
        deviceId={device.id}
        isEnterprise={isEnterprise}
        open={Boolean(troubleshootType)}
        onCancel={() => setTroubleshootType()}
        onSocketClose={() => setTimeout(() => setSocketClosed(true), 5000)}
        setSocketClosed={setSocketClosed}
        type={troubleshootType}
        userRoles={userRoles}
      />
      {monitorDetails && <MonitorDetailsDialog alert={monitorDetails} onClose={() => setMonitorDetails()} />}
    </Drawer>
  );
};

const actionCreators = {
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
  getDeviceAlerts,
  getDeviceLog,
  getDeviceInfo,
  getDeviceTwin,
  getSingleDeployment,
  saveGlobalSettings,
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar
};

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.deviceId] || {};
  const { config = {} } = device;
  const { deployment_id: configDeploymentId } = config;
  const { alerts = [], latest = [] } = state.monitor.alerts.byDeviceId[ownProps.deviceId] || {};
  return {
    alerts: alerts.slice(0, 20),
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    integrations: state.organization.externalDeviceIntegrations.filter(integration => integration.id),
    isEnterprise: getIsEnterprise(state),
    latestAlerts: latest.slice(0, 20),
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userRoles: getUserRoles(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
