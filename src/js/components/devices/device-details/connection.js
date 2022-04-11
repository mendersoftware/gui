import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ImportExport as ImportExportIcon, InfoOutlined as InfoIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { mdiConsole as ConsoleIcon } from '@mdi/js';

import { BEGINNING_OF_TIME } from '../../../constants/appConstants';
import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';
import MaterialDesignIcon from '../../common/materialdesignicon';
import MenderTooltip from '../../common/mendertooltip';
import Time from '../../common/time';
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

export const TroubleshootButton = ({ disabled, item, onClick }) => {
  const theme = useTheme();
  return (
    <Button onClick={() => onClick(item.key)} disabled={disabled} startIcon={item.icon} style={{ marginRight: theme.spacing(2) }}>
      <Typography variant="subtitle2" style={buttonStyle}>
        {item.title}
      </Typography>
    </Button>
  );
};

const troubleshootingTools = [
  {
    key: 'terminal',
    title: 'Launch a new Remote Terminal session',
    icon: <MaterialDesignIcon path={ConsoleIcon} />,
    needsWriteAccess: true,
    needsTroubleshoot: true
  },
  { key: 'transfer', title: 'Launch File Transfer', icon: <ImportExportIcon />, needsWriteAccess: false, needsTroubleshoot: false },
  { key: 'portForward', component: PortForwardLink, needsWriteAccess: false, needsTroubleshoot: true }
];

export const DeviceConnection = ({ device, docsVersion = '', hasAuditlogs, socketClosed, startTroubleshoot, style, userCapabilities }) => {
  const [availableTabs, setAvailableTabs] = useState(troubleshootingTools);

  const { canAuditlog, canTroubleshoot, canWriteDevices: hasWriteAccess } = userCapabilities;

  useEffect(() => {
    const allowedTabs = troubleshootingTools.reduce((accu, tab) => {
      if ((tab.needsWriteAccess && !hasWriteAccess) || (tab.needsTroubleshoot && !canTroubleshoot)) {
        return accu;
      }
      accu.push(tab);
      return accu;
    }, []);
    setAvailableTabs(allowedTabs);
  }, [hasWriteAccess, canTroubleshoot]);

  const { connect_status = DEVICE_CONNECT_STATES.unknown, connect_updated_ts } = device;
  return (
    <DeviceDataCollapse
      disableBottomBorder
      header={
        <div className="flexbox" style={{ flexDirection: 'row', ...style }}>
          {connect_status === DEVICE_CONNECT_STATES.unknown && <DeviceConnectionMissingNote docsVersion={docsVersion} />}
          {connect_status === DEVICE_CONNECT_STATES.disconnected && <DeviceDisconnectedNote docsVersion={docsVersion} lastConnectionTs={connect_updated_ts} />}
          {connect_status === DEVICE_CONNECT_STATES.connected &&
            availableTabs.map(item => {
              let Component = TroubleshootButton;
              if (item.component) {
                Component = item.component;
              }
              return <Component key={item.key} docsVersion={docsVersion} onClick={startTroubleshoot} disabled={!socketClosed} item={item} />;
            })}
          {canAuditlog && hasAuditlogs && connect_status !== DEVICE_CONNECT_STATES.unknown && (
            <Link className="flexbox center-aligned margin-left" to={`/auditlog?object_type=device&object_id=${device.id}&start_date=${BEGINNING_OF_TIME}`}>
              List all log entries for this device
            </Link>
          )}
        </div>
      }
      isAddOn
      title="Troubleshoot"
    ></DeviceDataCollapse>
  );
};

export default DeviceConnection;
