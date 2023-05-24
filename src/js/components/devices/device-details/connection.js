import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { InfoOutlined as InfoIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { BEGINNING_OF_TIME } from '../../../constants/appConstants';
import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../../../constants/organizationConstants';
import { formatAuditlogs } from '../../../utils/locationutils';
import MenderTooltip from '../../common/mendertooltip';
import Time from '../../common/time';
import Troubleshootdialog from '../dialogs/troubleshootdialog';
import DeviceDataCollapse from './devicedatacollapse';

const buttonStyle = { textTransform: 'none', textAlign: 'left' };
export const PortForwardLink = ({ docsVersion }) => (
  <MenderTooltip
    arrow
    title={
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Port forwarding</h3>
        <p>Port forwarding allows you to troubleshoot or use services on or via the device, without opening any ports on the device itself.</p>
        <p>
          To enable port forwarding you will need to install and configure the necessary software on the device and your workstation. Follow the link to learn
          more.
        </p>
      </div>
    }
  >
    <a href={`https://docs.mender.io/${docsVersion}add-ons/port-forward`} className="flexbox centered margin-left" target="_blank" rel="noopener noreferrer">
      Enable port forwarding
      <LaunchIcon className="margin-left-small" fontSize="small" />
    </a>
  </MenderTooltip>
);

export const DeviceConnectionNote = ({ children, style = buttonStyle }) => {
  const theme = useTheme();
  return (
    <div className="flexbox muted">
      <InfoIcon fontSize="small" style={{ marginRight: theme.spacing() }} />
      <Typography variant="body1" style={style}>
        {children}
      </Typography>
    </div>
  );
};

export const DeviceConnectionMissingNote = ({ docsVersion }) => (
  <DeviceConnectionNote>
    The troubleshoot add-on does not seem to be enabled on this device.
    <br />
    Please{' '}
    <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
      see the documentation
    </a>{' '}
    for a description on how it works and how to enable it.
  </DeviceConnectionNote>
);

export const DeviceDisconnectedNote = ({ docsVersion, lastConnectionTs }) => (
  <DeviceConnectionNote>
    The troubleshoot add-on is not currently connected on this device, it was last connected on <Time value={lastConnectionTs} />.
    <br />
    Please{' '}
    <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
      see the documentation
    </a>{' '}
    for more information.
  </DeviceConnectionNote>
);

const deviceAuditlogType = AUDIT_LOGS_TYPES.find(type => type.value === 'device');

export const DeviceConnection = ({
  className = '',
  device,
  docsVersion = '',
  hasAuditlogs,
  // socketClosed,
  launchTroubleshoot,
  userCapabilities,
  setSocketClosed
}) => {
  const { canAuditlog } = userCapabilities;

  useEffect(() => {
    launchTroubleshoot('terminal');
  }, []);

  const { connect_status = DEVICE_CONNECT_STATES.unknown, connect_updated_ts } = device;
  return (
    <DeviceDataCollapse
      header={
        <div className={`flexbox ${className}`}>
          {connect_status === DEVICE_CONNECT_STATES.unknown && <DeviceConnectionMissingNote docsVersion={docsVersion} />}
          {connect_status === DEVICE_CONNECT_STATES.disconnected && <DeviceDisconnectedNote docsVersion={docsVersion} lastConnectionTs={connect_updated_ts} />}
          {canAuditlog && hasAuditlogs && connect_status !== DEVICE_CONNECT_STATES.unknown && (
            <Link
              className="flexbox center-aligned margin-left"
              to={`/auditlog?${formatAuditlogs({ pageState: { type: deviceAuditlogType, detail: device.id, startDate: BEGINNING_OF_TIME } }, {})}`}
            >
              List all log entries for this device
            </Link>
          )}
        </div>
      }
      isAddOn
      title="Remote terminal"
    >
      {connect_status === DEVICE_CONNECT_STATES.connected && (
        <Troubleshootdialog device={device} hasAuditlogs={hasAuditlogs} setSocketClosed={setSocketClosed} userCapabilities={userCapabilities} />
      )}
    </DeviceDataCollapse>
  );
};

export default DeviceConnection;
