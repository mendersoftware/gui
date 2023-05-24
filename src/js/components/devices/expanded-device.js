import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Close as CloseIcon, Link as LinkIcon } from '@mui/icons-material';
import { Chip, Divider, Drawer, IconButton, Tab, Tabs, chipClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import copy from 'copy-to-clipboard';

import GatewayConnectionIcon from '../../../assets/img/gateway-connection.svg';
import GatewayIcon from '../../../assets/img/gateway.svg';
import { setSnackbar } from '../../actions/appActions';
import { decommissionDevice, getDeviceInfo, getDeviceTwin, getGatewayDevices, setDeviceTags, setDeviceTwin } from '../../actions/deviceActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { TIMEOUTS } from '../../constants/appConstants';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { getDemoDeviceAddress, stringToBoolean } from '../../helpers';
import {
  getDeviceTwinIntegrations,
  getDocsVersion,
  getFeatures,
  getIdAttribute,
  getTenantCapabilities,
  getUserCapabilities,
  getUserSettings
} from '../../selectors';
import Tracking from '../../tracking';
import DeviceIdentityDisplay from '../common/deviceidentity';
import { MenderTooltipClickable } from '../common/mendertooltip';
import { RelativeTime } from '../common/time';
import DeviceConnection from './device-details/connection';
import { IdentityTab } from './device-details/identity';
import MonitoringTab from './device-details/monitoring';
import DeviceNotifications from './device-details/notifications';
import DeviceQuickActions from './widgets/devicequickactions';

const useStyles = makeStyles()(theme => ({
  gatewayChip: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[900],
    path: {
      fill: theme.palette.grey[900]
    },
    [`.${chipClasses.icon}`]: {
      marginLeft: 10,
      width: 20
    },
    [`.${chipClasses.icon}.connected`]: {
      transform: 'scale(1.3)',
      width: 15
    }
  },
  deviceConnection: {
    marginRight: theme.spacing(2)
  },
  dividerTop: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2)
  }
}));

const refreshDeviceLength = TIMEOUTS.refreshDefault;

const GatewayConnectionNotification = ({ gatewayDevices, idAttribute, onClick }) => {
  const { classes } = useStyles();

  const onGatewayClick = () => {
    const query =
      gatewayDevices.length > 1 ? gatewayDevices.map(device => `id=${device.id}`).join('&') : `id=${gatewayDevices[0].id}&open=true&tab=device-system`;
    onClick(query);
  };

  return (
    <MenderTooltipClickable
      placement="bottom"
      title={
        <div style={{ maxWidth: 350 }}>
          Connected to{' '}
          {gatewayDevices.length > 1 ? (
            'multiple devices'
          ) : (
            <DeviceIdentityDisplay device={gatewayDevices[0]} idAttribute={idAttribute} isEditable={false} hasAdornment={false} />
          )}
        </div>
      }
    >
      <Chip className={classes.gatewayChip} icon={<GatewayConnectionIcon className="connected" />} label="Connected to gateway" onClick={onGatewayClick} />
    </MenderTooltipClickable>
  );
};

const GatewayNotification = ({ device, docsVersion, onClick }) => {
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
      <Chip className={classes.gatewayChip} icon={<GatewayIcon />} label="Gateway" onClick={onClick} />
    </MenderTooltipClickable>
  );
};

const deviceStatusCheck = ({ device: { status = DEVICE_STATES.accepted } }, states = [DEVICE_STATES.accepted]) => states.includes(status);

const tabs = [
  {
    component: DeviceConnection,
    title: () => 'Troubleshooting',
    value: 'troubleshoot',
    isApplicable: () => true
  },
  { component: IdentityTab, title: () => 'Identity', value: 'identity', isApplicable: () => true },
  {
    component: MonitoringTab,
    title: () => 'Monitoring',
    value: 'monitor',
    isApplicable: ({ tenantCapabilities: { hasMonitor }, ...rest }) => deviceStatusCheck(rest) && hasMonitor
  }
];

export const ExpandedDevice = ({
  abortDeployment,
  actionCallbacks,
  columnSelection,
  decommissionDevice,
  defaultConfig,
  device,
  deviceConfigDeployment,
  deviceId,
  devicesById,
  docsVersion,
  features,
  getDeviceDeployments,
  getDeviceInfo,
  getDeviceLog,
  getDeviceTwin,
  getGatewayDevices,
  getSingleDeployment,
  groupFilters,
  idAttribute,
  integrations,
  latestAlerts,
  onClose,
  refreshDevices,
  resetDeviceDeployments,
  saveGlobalSettings,
  selectedGroup,
  setDetailsTab,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar,
  showHelptips,
  tabSelection,
  tenantCapabilities,
  userCapabilities
}) => {
  const [socketClosed, setSocketClosed] = useState(true);
  const timer = useRef();
  const navigate = useNavigate();
  const { classes } = useStyles();

  const { attributes = {}, isOffline, gatewayIds = [] } = device;
  const { mender_is_gateway, mender_gateway_system_id } = attributes;
  const isGateway = stringToBoolean(mender_is_gateway);

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

  useEffect(() => {
    if (!(device.id && mender_gateway_system_id)) {
      return;
    }
    getGatewayDevices(device.id);
  }, [device.id, mender_gateway_system_id]);

  const onDecommissionDevice = device_id => {
    // close dialog!
    // close expanded device
    // trigger reset of list!
    return decommissionDevice(device_id).finally(() => {
      refreshDevices();
      onClose();
    });
  };

  const launchTroubleshoot = () => {
    Tracking.event({ category: 'devices', action: 'open_terminal' });
    setSocketClosed(false);
  };

  const copyLinkToClipboard = () => {
    const location = window.location.href.substring(0, window.location.href.indexOf('/devices') + '/devices'.length);
    copy(`${location}?id=${deviceId}`);
    setSnackbar('Link copied to clipboard');
  };

  const scrollToMonitor = () => setDetailsTab('monitor');

  const selectedStaticGroup = selectedGroup && !groupFilters.length ? selectedGroup : undefined;

  const scrollToDeviceSystem = target => {
    if (target) {
      return navigate(`/devices?${target}`);
    }
    return setDetailsTab('device-system');
  };

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

  const { component: SelectedTab, value: selectedTab } = availableTabs.find(tab => tab.value === tabSelection) ?? tabs[0];

  const commonProps = {
    abortDeployment,
    classes,
    columnSelection,
    defaultConfig,
    device,
    deviceConfigDeployment,
    docsVersion,
    getDeviceDeployments,
    getDeviceLog,
    getDeviceTwin,
    getSingleDeployment,
    idAttribute,
    integrations,
    latestAlerts,
    launchTroubleshoot,
    onDecommissionDevice,
    refreshDevices,
    resetDeviceDeployments,
    saveGlobalSettings,
    setDetailsTab,
    setDeviceTags,
    setDeviceTwin,
    setSnackbar,
    setSocketClosed,
    showHelptips,
    socketClosed,
    tenantCapabilities: { hasAuditlogs },
    userCapabilities
  };
  return (
    <Drawer anchor="right" className="expandedDevice" open={!!deviceId} onClose={onCloseClick} PaperProps={{ style: { minWidth: '67vw' } }}>
      <div className="flexbox center-aligned space-between">
        <div className="flexbox center-aligned">
          <h3 className="flexbox">
            Device information for{' '}
            {<DeviceIdentityDisplay device={device} idAttribute={idAttribute} isEditable={false} hasAdornment={false} style={{ marginLeft: 4 }} />}
          </h3>
          <IconButton onClick={copyLinkToClipboard} size="large">
            <LinkIcon />
          </IconButton>
        </div>
        <div className="flexbox center-aligned">
          {isGateway && <GatewayNotification device={device} docsVersion={docsVersion} onClick={() => scrollToDeviceSystem()} />}
          {!!gatewayIds.length && (
            <GatewayConnectionNotification
              gatewayDevices={gatewayIds.map(gatewayId => devicesById[gatewayId])}
              idAttribute={idAttribute}
              onClick={scrollToDeviceSystem}
            />
          )}
          <div className={`${isOffline ? 'red' : 'muted'} margin-left margin-right flexbox`}>
            <div className="margin-right-small">Last check-in:</div>
            <RelativeTime updateTime={device.updated_ts} />
          </div>
          <IconButton style={{ marginLeft: 'auto' }} onClick={onCloseClick} aria-label="close" size="large">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <DeviceNotifications alerts={latestAlerts} device={device} isOffline={isOffline} onClick={scrollToMonitor} />
      <Divider className={classes.dividerTop} />
      <Tabs value={selectedTab} onChange={(e, tab) => setDetailsTab(tab)} textColor="primary">
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
  decommissionDevice,
  getDeviceInfo,
  getDeviceTwin,
  getGatewayDevices,
  saveGlobalSettings,
  setDeviceTags,
  setDeviceTwin,
  setSnackbar
};

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.deviceId] || {};
  const { latest = [] } = state.monitor.alerts.byDeviceId[ownProps.deviceId] || {};
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  const { columnSelection = [] } = getUserSettings(state);
  return {
    alertListState: state.monitor.alerts.alertList,
    columnSelection,
    defaultConfig: state.users.globalSettings.defaultDeviceConfig,
    device,
    devicesById: state.devices.byId,
    docsVersion: getDocsVersion(state),
    features: getFeatures(state),
    groupFilters,
    idAttribute: getIdAttribute(state),
    integrations: getDeviceTwinIntegrations(state),
    latestAlerts: latest,
    selectedGroup,
    showHelptips: state.users.showHelptips,
    tenantCapabilities: getTenantCapabilities(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(ExpandedDevice);
