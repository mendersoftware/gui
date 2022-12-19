import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Close as CloseIcon, Link as LinkIcon } from '@mui/icons-material';
import { Chip, Divider, Drawer, IconButton, Tab, Tabs } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import copy from 'copy-to-clipboard';

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
import { saveGlobalSettings } from '../../actions/userActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { DEVICE_STATES, EXTERNAL_PROVIDER } from '../../constants/deviceConstants';
import { getDemoDeviceAddress, stringToBoolean } from '../../helpers';
import { getDeviceTwinIntegrations, getDocsVersion, getFeatures, getIdAttribute, getTenantCapabilities, getUserCapabilities } from '../../selectors';
import Tracking from '../../tracking';
import DeviceIdentityDisplay from '../common/deviceidentity';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { RelativeTime } from '../common/time';
import DeviceConfiguration from './device-details/configuration';
import { TroubleshootTab } from './device-details/connection';
import DeviceInventory from './device-details/deviceinventory';
import { IntegrationTab } from './device-details/devicetwin';
import { IdentityTab } from './device-details/identity';
import InstalledSoftware from './device-details/installedsoftware';
import MonitoringTab from './device-details/monitoring';
import DeviceNotifications from './device-details/notifications';
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
  }
}));

const refreshDeviceLength = TIMEOUTS.refreshDefault;

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

const DeviceSystemTab = () => <div />;

const tabs = [
  { component: IdentityTab, title: () => 'Identity', value: 'identity', isApplicable: () => true },
  {
    component: DeviceInventory,
    title: () => 'Inventory',
    value: 'inventory',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted } }) => status === DEVICE_STATES.accepted
  },
  {
    component: InstalledSoftware,
    title: () => 'Software',
    value: 'software',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted } }) => status === DEVICE_STATES.accepted
  },
  {
    component: DeviceConfiguration,
    title: () => 'Configuration',
    value: 'configuration',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted }, tenantCapabilities: { hasDeviceConfig }, userCapabilities: { canConfigure } }) =>
      hasDeviceConfig && canConfigure && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status)
  },
  {
    component: MonitoringTab,
    title: () => 'Monitoring',
    value: 'monitor',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted }, tenantCapabilities: { hasMonitor } }) => status === DEVICE_STATES.accepted && hasMonitor
  },
  {
    component: TroubleshootTab,
    title: () => 'Troubleshooting',
    value: 'troubleshoot',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted }, tenantCapabilities: { hasDeviceConnect } }) =>
      status === DEVICE_STATES.accepted && hasDeviceConnect
  },
  {
    component: IntegrationTab,
    title: ({ integrations }) => {
      if (integrations.length > 1) {
        return 'Device Twin';
      }
      const { title, twinTitle } = EXTERNAL_PROVIDER[integrations[0].provider];
      return `${title} ${twinTitle}`;
    },
    value: 'device-twin',
    isApplicable: ({ device: { status = DEVICE_STATES.accepted }, integrations }) =>
      !!integrations.length && [DEVICE_STATES.accepted, DEVICE_STATES.preauth].includes(status)
  },
  {
    component: DeviceSystemTab,
    title: () => 'Device System',
    value: 'device-system',
    isApplicable: ({ device: { attributes } }) => attributes?.mender_is_gateway
  }
];

export const ExpandedDevice = ({
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
  defaultConfig,
  device,
  deviceConfigDeployment,
  deviceId,
  docsVersion,
  features,
  getDeviceInfo,
  getDeviceLog,
  getDeviceTwin,
  getSingleDeployment,
  groupFilters,
  idAttribute,
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
  setDeviceConfig,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar,
  showHelptips,
  tenantCapabilities,
  userCapabilities
}) => {
  const { attributes = {}, isOffline } = device;
  const [socketClosed, setSocketClosed] = useState(true);
  const [selectedTab, setSelectedTab] = useState(tabs[0].value);
  const [troubleshootType, setTroubleshootType] = useState();
  const timer = useRef();
  const navigate = useNavigate();
  const { classes } = useStyles();

  const { hasAuditlogs } = tenantCapabilities;

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    clearInterval(timer.current);
    timer.current = setInterval(() => getDeviceInfo(deviceId), refreshDeviceLength);
    getDeviceInfo(deviceId);
    return () => {
      clearInterval(timer.current);
    };
  }, [deviceId, device.status]);

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
    copy(`${location}?id=${deviceId}`);
    setSnackbar('Link copied to clipboard');
  };

  const scrollToMonitor = () => setSelectedTab('monitor');

  const onCreateDeploymentClick = () => navigate(`/deployments?open=true&deviceId=${deviceId}`);

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

  const onCloseClick = useCallback(() => {
    if (deviceId) {
      onClose();
    }
  }, [deviceId, onClose]);

  const availableTabs = tabs.reduce((accu, tab) => {
    if (tab.isApplicable({ device, integrations, tenantCapabilities, userCapabilities })) {
      accu.push(tab);
    }
    return accu;
  }, []);

  const SelectedTab = useMemo(() => availableTabs.find(tab => tab.value === selectedTab).component, [selectedTab]);
  const commonProps = {
    abortDeployment,
    applyDeviceConfig,
    classes,
    defaultConfig,
    device,
    deviceConfigDeployment,
    docsVersion,
    getDeviceLog,
    getDeviceTwin,
    getSingleDeployment,
    integrations,
    latestAlerts,
    launchTroubleshoot,
    onDecommissionDevice,
    refreshDevices,
    saveGlobalSettings,
    setDeviceConfig,
    setDeviceTags,
    setDeviceTwin,
    setSnackbar,
    setSocketClosed,
    setTroubleshootType,
    showHelptips,
    socketClosed,
    tenantCapabilities: { hasAuditlogs },
    troubleshootType,
    userCapabilities
  };
  return (
    <Drawer anchor="right" className="expandedDevice" open={!!deviceId} onClose={onCloseClick} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox center-aligned space-between">
        <div className="flexbox center-aligned">
          <h3 className="flexbox">
            Device information for {<DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} style={{ marginLeft: 4 }} />}
          </h3>
          <IconButton onClick={copyLinkToClipboard} size="large">
            <LinkIcon />
          </IconButton>
        </div>
        <div className="flexbox center-aligned">
          <div className={`${isOffline ? 'red' : 'muted'} margin-left margin-right flexbox`}>
            <div className="margin-right-small">Last check-in:</div>
            <RelativeTime updateTime={device.updated_ts} />
          </div>
          {isGateway && <GatewayNotification device={device} docsVersion={docsVersion} />}
          <IconButton style={{ marginLeft: 'auto' }} onClick={onCloseClick} aria-label="close" size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <DeviceNotifications alerts={latestAlerts} device={device} isOffline={isOffline} onClick={scrollToMonitor} />
      <Divider className={classes.dividerTop} />
      <Tabs value={selectedTab} onChange={(e, tab) => setSelectedTab(tab)} textColor="primary">
        {availableTabs.map(item => (
          <Tab key={item.value} label={item.title({ integrations })} value={item.value} />
        ))}
      </Tabs>
      <SelectedTab {...commonProps} />
      <DeviceQuickActions
        actionCallbacks={actionCallbacks}
        devices={[device]}
        features={features}
        isSingleDevice
        selectedGroup={selectedStaticGroup}
        selectedRows={[0]}
        tenantCapabilities={tenantCapabilities}
        userCapabilities={userCapabilities}
      />
    </Drawer>
  );
};

const actionCreators = {
  abortDeployment,
  applyDeviceConfig,
  decommissionDevice,
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
  const { latest = [] } = state.monitor.alerts.byDeviceId[ownProps.deviceId] || {};
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  return {
    alertListState: state.monitor.alerts.alertList,
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    deviceConfigDeployment: state.deployments.byId[configDeploymentId] || {},
    docsVersion: getDocsVersion(state),
    features: getFeatures(state),
    groupFilters,
    idAttribute: getIdAttribute(state),
    integrations: getDeviceTwinIntegrations(state),
    latestAlerts: latest,
    onboardingComplete: state.onboarding.complete,
    selectedGroup,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
