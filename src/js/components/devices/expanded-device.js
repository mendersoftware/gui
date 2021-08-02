import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import { Button, Divider, Drawer, IconButton } from '@material-ui/core';
import { Close as CloseIcon, Link as LinkIcon, Replay as ReplayIcon } from '@material-ui/icons';

import { setSnackbar } from '../../actions/appActions';
import { abortDeployment, getDeviceLog, getSingleDeployment } from '../../actions/deploymentActions';
import {
  applyDeviceConfig,
  decommissionDevice,
  getDeviceAuth,
  getDeviceById,
  getDeviceConfig,
  getDeviceConnect,
  setDeviceConfig,
  setDeviceTags
} from '../../actions/deviceActions';
import { getDeviceAlerts } from '../../actions/monitorActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { DEVICE_ONLINE_CUTOFF, DEVICE_STATES } from '../../constants/deviceConstants';
import ForwardingLink from '../common/forwardlink';
import RelativeTime from '../common/relative-time';
import { getDocsVersion, getIsEnterprise, getTenantCapabilities } from '../../selectors';
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
import DeviceNotifications from './device-details/notifications';
import LogDialog from '../common/dialogs/log';

const refreshDeviceLength = 10000;
let timer;

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
  getDeviceAuth,
  getDeviceById,
  getDeviceConfig,
  getDeviceConnect,
  getSingleDeployment,
  isEnterprise,
  onClose,
  open,
  refreshDevices,
  saveGlobalSettings,
  setDeviceConfig,
  setDeviceTags,
  setSnackbar,
  showHelptips,
  tenantCapabilities
}) => {
  const { status = DEVICE_STATES.accepted, updated_ts = '' } = device;
  const [socketClosed, setSocketClosed] = useState(true);
  const [troubleshootType, setTroubleshootType] = useState();
  const [monitorLog, setMonitorLog] = useState('');
  const [yesterday, setYesterday] = useState(new Date());
  const monitoring = useRef();

  const { hasDeviceConfig, hasDeviceConnect, hasMonitor } = tenantCapabilities;

  useEffect(() => {
    if (!device.id) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(() => getDeviceInfo(device), refreshDeviceLength);
    getDeviceInfo(device);

    const today = new Date();
    const intervalName = `${DEVICE_ONLINE_CUTOFF.intervalName.charAt(0).toUpperCase()}${DEVICE_ONLINE_CUTOFF.intervalName.substring(1)}`;
    const setter = `set${intervalName}s`;
    const getter = `get${intervalName}s`;
    today[setter](today[getter]() - DEVICE_ONLINE_CUTOFF.interval);
    setYesterday(today);
    return () => {
      clearInterval(timer);
    };
  }, [device.id, device.status]);

  const getDeviceInfo = device => {
    getDeviceAuth(device.id);
    if (hasDeviceConfig && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(device.status)) {
      getDeviceConfig(device.id);
    }
    if (device.status === DEVICE_STATES.accepted) {
      // Get full device identity details for single selected device
      getDeviceById(device.id);
      getDeviceConnect(device.id);
      if (hasMonitor) {
        getDeviceAlerts(device.id);
      }
    }
  };

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

  const onLogClick = (id, content) => {
    // getDeviceMonitorLog(id);
    setMonitorLog(content);
  };

  const scrollToMonitor = () => {
    monitoring.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const deviceIdentifier = device?.attributes?.name ?? device?.id ?? '-';
  const isAcceptedDevice = status === DEVICE_STATES.accepted;
  const isOffline = useMemo(() => new Date(updated_ts) < yesterday, [updated_ts, yesterday]);
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
      <DeviceNotifications alerts={alerts} device={device} isOffline={isOffline} onClick={scrollToMonitor} />
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
        <DeviceMonitoring alerts={alerts} device={device} innerRef={monitoring} isOffline={isOffline} onLogClick={onLogClick} />
      )}
      {isAcceptedDevice && hasDeviceConnect && (
        <DeviceConnection
          device={device}
          docsVersion={docsVersion}
          startTroubleshoot={launchTroubleshoot}
          socketClosed={socketClosed}
          style={{ marginRight: theme.spacing(2) }}
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
      />
      {monitorLog && <LogDialog logData={monitorLog} onClose={() => setMonitorLog('')} type="monitorLog" />}
    </Drawer>
  );
};

const actionCreators = {
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
  getDeviceAlerts,
  getDeviceLog,
  getDeviceAuth,
  getDeviceById,
  getDeviceConfig,
  getDeviceConnect,
  getSingleDeployment,
  saveGlobalSettings,
  setDeviceConfig,
  setDeviceTags,
  setSnackbar
};

const mapStateToProps = (state, ownProps) => {
  const tenantCapabilities = getTenantCapabilities(state);
  const device = state.devices.byId[ownProps.deviceId] || {};
  const { config = {} } = device;
  const { deployment_id: configDeploymentId } = config;
  const alerts = state.monitor.alerts.byDeviceId[ownProps.deviceId] || [];
  return {
    alerts: alerts.slice(0, 20),
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    isEnterprise: getIsEnterprise(state),
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips,
    tenantCapabilities
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
