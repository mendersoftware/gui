import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import copy from 'copy-to-clipboard';

import { Chip, Divider, Drawer, IconButton } from '@mui/material';
import { Close as CloseIcon, Link as LinkIcon } from '@mui/icons-material';
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
import { DEVICE_STATES, EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { RelativeTime } from '../common/time';
import { getDemoDeviceAddress, stringToBoolean } from '../../helpers';
import { getDocsVersion, getFeatures, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import Tracking from '../../tracking';
import { useDebounce } from '../../utils/debouncehook';
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
import DeviceQuickActions from './widgets/devicequickactions';

const useStyles = makeStyles()(theme => ({
  gatewayChip: {
    color: theme.palette.grey[900],
    path: {
      fill: theme.palette.grey[900]
    }
  },
  gatewayIcon: {
    width: 20
  },
  deviceConnection: { marginRight: theme.spacing(2) },
  dividerTop: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2)
  },
  dividerBottom: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
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
          <a href={`https://docs.mender.io/${docsVersion}get-started/mender-gateway`} target="_blank" rel="noopener noreferrer">
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
  features,
  getDeviceAlerts,
  getDeviceInfo,
  getDeviceLog,
  getDeviceTwin,
  getSingleDeployment,
  groupFilters,
  integrations,
  latestAlerts,
  onAddDevicesToGroup,
  onAuthorizationChange,
  onClose,
  onDeviceDismiss,
  onMakeGatewayClick,
  onRemoveDevicesFromGroup,
  refreshDevices,
  saveGlobalSettings,
  selectedGroup,
  setAlertListState,
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar,
  showHelptips,
  tenantCapabilities,
  userCapabilities
}) => {
  const { attributes = {}, isOffline, status = DEVICE_STATES.accepted } = device;
  const [socketClosed, setSocketClosed] = useState(true);
  const [troubleshootType, setTroubleshootType] = useState();
  const [monitorDetails, setMonitorDetails] = useState();
  const monitoring = useRef();
  const timer = useRef();
  const navigate = useNavigate();
  const { classes } = useStyles();

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

  const onCreateDeploymentClick = () => navigate(`/deployments?open=true&deviceId=${device.id}`);

  const deviceIdentifier = attributes.name ?? device.id ?? '-';
  const isAcceptedDevice = status === DEVICE_STATES.accepted;
  const isGateway = stringToBoolean(attributes.mender_is_gateway);
  const actionCallbacks = {
    onAddDevicesToGroup,
    onAuthorizationChange,
    onDeviceDismiss,
    onRemoveDevicesFromGroup,
    onPromoteGateway: onMakeGatewayClick,
    onCreateDeployment: onCreateDeploymentClick
  };
  const selectedStaticGroup = selectedGroup && !groupFilters.length ? selectedGroup : undefined;

  const hasEntered = useDebounce(!!device.id, 300);
  const onCloseClick = useCallback(() => {
    if (hasEntered) {
      onClose();
    }
  }, [hasEntered, onClose]);

  return (
    <Drawer anchor="right" className="expandedDevice" open={!!device.id} onClose={onCloseClick} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox center-aligned">
        <h3>Device information for {deviceIdentifier}</h3>
        <IconButton onClick={copyLinkToClipboard} size="large">
          <LinkIcon />
        </IconButton>
        <div className={`${isOffline ? 'red' : 'muted'} margin-left margin-right`}>
          Last check-in: <RelativeTime updateTime={device.updated_ts} />
        </div>
        {isGateway && <GatewayNotification device={device} docsVersion={docsVersion} />}
        <IconButton style={{ marginLeft: 'auto' }} onClick={onCloseClick} aria-label="close" size="large">
          <CloseIcon />
        </IconButton>
      </div>
      <DeviceNotifications alerts={latestAlerts} device={device} isOffline={isOffline} onClick={scrollToMonitor} />
      <Divider className={classes.dividerTop} />
      <DeviceIdentity device={device} setSnackbar={setSnackbar} />
      <AuthStatus
        device={device}
        decommission={onDecommissionDevice}
        deviceListRefresh={refreshDevices}
        disableBottomBorder={!isAcceptedDevice}
        showHelptips={showHelptips}
      />
      <DeviceTags device={device} setSnackbar={setSnackbar} setDeviceTags={setDeviceTags} showHelptips={showHelptips} />
      {!!integrations.length &&
        [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status) &&
        integrations.map(integration => (
          <DeviceTwin key={integration.id} device={device} integration={integration} getDeviceTwin={getDeviceTwin} setDeviceTwin={setDeviceTwin} />
        ))}
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
          className={classes.deviceConnection}
          device={device}
          docsVersion={docsVersion}
          hasAuditlogs={hasAuditlogs}
          socketClosed={socketClosed}
          startTroubleshoot={launchTroubleshoot}
          userCapabilities={userCapabilities}
        />
      )}
      <Divider className={classes.dividerBottom} />
      <TroubleshootDialog
        device={device}
        open={Boolean(troubleshootType)}
        onCancel={() => setTroubleshootType()}
        setSocketClosed={setSocketClosed}
        type={troubleshootType}
        userCapabilities={userCapabilities}
      />
      {monitorDetails && <MonitorDetailsDialog alert={monitorDetails} onClose={() => setMonitorDetails()} />}
      <DeviceQuickActions
        actionCallbacks={actionCallbacks}
        devices={[device]}
        features={features}
        isSingleDevice
        selectedGroup={selectedStaticGroup}
        selectedRows={[0]}
        tenantCapabilities={tenantCapabilities}
      />
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
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  return {
    alertListState: state.monitor.alerts.alertList,
    alerts: alerts,
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    features: getFeatures(state),
    groupFilters,
    integrations: state.organization.externalDeviceIntegrations.filter(integration => integration.id && EXTERNAL_PROVIDER[integration.provider]?.deviceTwin),
    latestAlerts: latest,
    onboardingComplete: state.onboarding.complete,
    selectedGroup,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
