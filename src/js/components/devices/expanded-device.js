import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';

import { Button, Chip, Divider, Drawer, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close as CloseIcon, Link as LinkIcon, Replay as ReplayIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';

import GatewayIcon from '../../../assets/img/gateway.svg';
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
import { getDeviceAlerts, setAlertListState } from '../../actions/monitorActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import ForwardingLink from '../common/forwardlink';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { RelativeTime } from '../common/time';
import { getDemoDeviceAddress, stringToBoolean } from '../../helpers';
import { getDocsVersion, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import Tracking from '../../tracking';
import TroubleshootDialog from './dialogs/troubleshootdialog';
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

const useStyles = makeStyles()(theme => ({
  gatewayChip: {
    color: theme.palette.grey[900],
    path: {
      fill: theme.palette.grey[900]
    }
  },
  gatewayIcon: {
    width: 20
  }
}));

const refreshDeviceLength = 10000;

const GatewayNotification = ({ device, docsVersion }) => {
  const ipAddress = getDemoDeviceAddress([device]);
  const { classes } = useStyles();
  return (
    <MenderTooltipClickable
      placement="bottom"
      title={
        <div style={{ maxWidth: 350 }}>
          For information about connecting other devices to this gateway, please refer to the{' '}
          <a href={`https://docs.mender.io/${docsVersion}server-integration/mender-gateway`} target="_blank" rel="noopener noreferrer">
            Mender Gateway documentation
          </a>
          . This device is reachable via <i>{ipAddress}</i>.
        </div>
      }
    >
      <Chip className={classes.gatewayChip} icon={<GatewayIcon className={classes.gatewayIcon} />} label="Gateway" />
    </MenderTooltipClickable>
  );
};

export const ExpandedDevice = ({
  abortDeployment,
  alertListState,
  alerts,
  applyDeviceConfig,
  decommissionDevice,
  defaultConfig,
  device,
  deviceConfigDeployment,
  docsVersion,
  getDeviceAlerts,
  getDeviceInfo,
  getDeviceLog,
  getDeviceTwin,
  getSingleDeployment,
  integrations,
  latestAlerts,
  onClose,
  onMakeGatewayClick,
  open,
  refreshDevices,
  saveGlobalSettings,
  setAlertListState,
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar,
  showHelptips,
  tenantCapabilities,
  userCapabilities
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { attributes = {}, isOffline, status = DEVICE_STATES.accepted } = device;
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

  const deviceIdentifier = attributes.name ?? device.id ?? '-';
  const isAcceptedDevice = status === DEVICE_STATES.accepted;
  const isGateway = stringToBoolean(attributes.mender_is_gateway);

  return (
    <Drawer anchor="right" className="expandedDevice" open={open} onClose={onClose} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox center-aligned">
        <h3>Device information for {deviceIdentifier}</h3>
        <IconButton onClick={copyLinkToClipboard} size="large">
          <LinkIcon />
        </IconButton>
        <div className={`${isOffline ? 'red' : 'muted'} margin-left margin-right`}>
          Last check-in: <RelativeTime updateTime={device.updated_ts} />
        </div>
        {isGateway && <GatewayNotification device={device} docsVersion={docsVersion} />}
        <IconButton style={{ marginLeft: 'auto' }} onClick={onClose} aria-label="close" size="large">
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
          alertListState={alertListState}
          alerts={alerts}
          device={device}
          docsVersion={docsVersion}
          getAlerts={getDeviceAlerts}
          innerRef={monitoring}
          isOffline={isOffline}
          latestAlerts={latestAlerts}
          onDetailsClick={setMonitorDetails}
          setAlertListState={setAlertListState}
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
          userCapabilities={userCapabilities}
        />
      )}
      <Divider style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(2) }} />
      {isAcceptedDevice && (
        <div className="flexbox center-aligned">
          <Button to={`/deployments?open=true&deviceId=${device.id}`} component={ForwardingLink} startIcon={<ReplayIcon />}>
            Create a deployment for this device
          </Button>
          {!isGateway && (
            <Button onClick={onMakeGatewayClick} startIcon={<GatewayIcon className={classes.gatewayIcon} />} style={{ marginLeft: 30 }}>
              Promote to Mender gateway
            </Button>
          )}
        </div>
      )}

      <TroubleshootDialog
        deviceId={device.id}
        hasAuditlogs={hasAuditlogs}
        open={Boolean(troubleshootType)}
        onCancel={() => setTroubleshootType()}
        onSocketClose={() => setTimeout(() => setSocketClosed(true), 5000)}
        setSocketClosed={setSocketClosed}
        type={troubleshootType}
        userCapabilities={userCapabilities}
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
  setAlertListState,
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
    alertListState: state.monitor.alerts.alertList,
    alerts: alerts,
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    integrations: state.organization.externalDeviceIntegrations.filter(integration => integration.id),
    latestAlerts: latest,
    onboardingComplete: state.onboarding.complete,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
