// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ImportExport as ImportExportIcon, InfoOutlined as InfoIcon, Launch as LaunchIcon } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { mdiConsole as ConsoleIcon } from '@mdi/js';

import { BEGINNING_OF_TIME } from '../../../constants/appConstants';
import { ALL_DEVICES, DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';
import { AUDIT_LOGS_TYPES } from '../../../constants/organizationConstants';
import { checkPermissionsObject, uiPermissionsById } from '../../../constants/userConstants';
import { formatAuditlogs } from '../../../utils/locationutils';
import DocsLink from '../../common/docslink';
import MaterialDesignIcon from '../../common/materialdesignicon';
import MenderTooltip from '../../common/mendertooltip';
import Time from '../../common/time';
import Troubleshootdialog from '../dialogs/troubleshootdialog';
import DeviceDataCollapse from './devicedatacollapse';

const buttonStyle = { textTransform: 'none', textAlign: 'left' };
export const PortForwardLink = () => (
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
    <DocsLink className="flexbox centered margin-left" path="add-ons/port-forward">
      Enable port forwarding
      <LaunchIcon className="margin-left-small" fontSize="small" />
    </DocsLink>
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

export const DeviceConnectionMissingNote = () => (
  <DeviceConnectionNote>
    The troubleshoot add-on does not seem to be enabled on this device.
    <br />
    Please <DocsLink path="add-ons/remote-terminal" title="see the documentation" /> for a description on how it works and how to enable it.
  </DeviceConnectionNote>
);

export const DeviceDisconnectedNote = ({ lastConnectionTs }) => (
  <DeviceConnectionNote>
    The troubleshoot add-on is not currently connected on this device, it was last connected on <Time value={lastConnectionTs} />.
    <br />
    Please <DocsLink path="add-ons/remote-terminal" title="see the documentation" /> for more information.
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

const deviceAuditlogType = AUDIT_LOGS_TYPES.find(type => type.value === 'device');

export const DeviceConnection = ({ className = '', device, hasAuditlogs, socketClosed, startTroubleshoot, userCapabilities }) => {
  const [availableTabs, setAvailableTabs] = useState(troubleshootingTools);

  const { canAuditlog, canTroubleshoot, canWriteDevices: hasWriteAccess, groupsPermissions } = userCapabilities;

  useEffect(() => {
    const allowedTabs = troubleshootingTools.reduce((accu, tab) => {
      if (
        (tab.needsWriteAccess && (!hasWriteAccess || !checkPermissionsObject(groupsPermissions, uiPermissionsById.connect.value, device.group, ALL_DEVICES))) ||
        (tab.needsTroubleshoot && !canTroubleshoot)
      ) {
        return accu;
      }
      accu.push(tab);
      return accu;
    }, []);
    setAvailableTabs(allowedTabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWriteAccess, canTroubleshoot, JSON.stringify(groupsPermissions), device.group]);

  const { connect_status = DEVICE_CONNECT_STATES.unknown, connect_updated_ts } = device;
  return (
    <DeviceDataCollapse
      header={
        <div className={`flexbox ${className}`}>
          {connect_status === DEVICE_CONNECT_STATES.unknown && <DeviceConnectionMissingNote />}
          {connect_status === DEVICE_CONNECT_STATES.disconnected && <DeviceDisconnectedNote lastConnectionTs={connect_updated_ts} />}
          {connect_status === DEVICE_CONNECT_STATES.connected &&
            availableTabs.map(item => {
              let Component = TroubleshootButton;
              if (item.component) {
                Component = item.component;
              }
              return <Component key={item.key} onClick={startTroubleshoot} disabled={socketClosed} item={item} />;
            })}
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
      title="Troubleshoot"
    ></DeviceDataCollapse>
  );
};

export default DeviceConnection;

export const TroubleshootTab = ({
  classes,
  device,
  tenantCapabilities: { hasAuditlogs },
  socketClosed,
  launchTroubleshoot,
  userCapabilities,
  troubleshootType,
  setTroubleshootType,
  setSocketClosed
}) => (
  <>
    <DeviceConnection
      className={classes.deviceConnection}
      device={device}
      hasAuditlogs={hasAuditlogs}
      socketClosed={socketClosed}
      startTroubleshoot={launchTroubleshoot}
      userCapabilities={userCapabilities}
    />
    <Troubleshootdialog
      device={device}
      open={Boolean(troubleshootType)}
      onCancel={() => setTroubleshootType()}
      setSocketClosed={setSocketClosed}
      type={troubleshootType}
    />
  </>
);
