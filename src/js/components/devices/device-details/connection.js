import React from 'react';
import Time from 'react-time';
import ReactTooltip from 'react-tooltip';

import { Button, Typography, SvgIcon } from '@material-ui/core';
import { mdiConsole as ConsoleIcon } from '@mdi/js';
import { ImportExport as ImportExportIcon, InfoOutlined as InfoIcon, Launch as LaunchIcon } from '@material-ui/icons';

import theme from '../../../themes/mender-theme';
import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';
import DeviceDataCollapse from './devicedatacollapse';

const buttonStyle = { textTransform: 'none', textAlign: 'left' };

const troubleshootingTools = {
  terminal: {
    title: 'Launch a new Remote Terminal session',
    icon: (
      <SvgIcon fontSize="inherit">
        <path d={ConsoleIcon} />
      </SvgIcon>
    )
  },
  transfer: { title: 'Launch File Transfer', icon: <ImportExportIcon /> }
};

export const PortForwardLink = ({ docsVersion }) => (
  <>
    <a
      id="port-forward-link"
      data-tip
      data-for="port-forward-tip"
      href={`https://docs.mender.io/${docsVersion}add-ons/port-forward`}
      className="flexbox centered margin-left"
      target="_blank"
      rel="noopener noreferrer"
    >
      Enable port forwarding
      <LaunchIcon className="margin-left-small" fontSize="small" />
    </a>
    <ReactTooltip id="port-forward-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
      <div style={{ whiteSpace: 'normal' }}>
        <h3>Port forwarding</h3>
        <p>Port forwarding allows you to troubleshoot or use services on or via the device, without opening any ports on the device itself.</p>
        <p>
          To enable port forwarding you will need to install and configure the necessary software on the device and your workstation. Follow the link to learn
          more.
        </p>
      </div>
    </ReactTooltip>
  </>
);

const DeviceConnectionNote = ({ children, style }) => (
  <div className="flexbox text-muted">
    <InfoIcon fontSize="small" style={{ marginRight: theme.spacing() }} />
    <Typography variant="body1" style={style}>
      {children}
    </Typography>
  </div>
);

export const DeviceConnectionMissingNote = ({ style, docsVersion }) => (
  <DeviceConnectionNote style={style}>
    The troubleshoot add-on does not seem to be enabled on this device.
    <br />
    Please{' '}
    <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
      see the documentation
    </a>{' '}
    for a description on how it works and how to enable it.
  </DeviceConnectionNote>
);

export const DeviceDisconnectedNote = ({ docsVersion, lastConnectionTs, style }) => (
  <DeviceConnectionNote style={style}>
    The troubleshoot add-on is not currently connected on this device, it was last connected on <Time value={lastConnectionTs} format="YYYY-MM-DD HH:mm" />.
    <br />
    Please{' '}
    <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
      see the documentation
    </a>{' '}
    for more information.
  </DeviceConnectionNote>
);

export const DeviceConnection = ({ device, docsVersion = '', startTroubleshoot, socketClosed, style }) => {
  const { connect_status = DEVICE_CONNECT_STATES.unknown, connect_updated_ts } = device;
  return (
    <DeviceDataCollapse
      disableBottomBorder
      header={
        <div className="flexbox" style={{ flexDirection: 'row', ...style }}>
          {connect_status === DEVICE_CONNECT_STATES.unknown && <DeviceConnectionMissingNote docsVersion={docsVersion} style={buttonStyle} />}
          {connect_status === DEVICE_CONNECT_STATES.disconnected && (
            <DeviceDisconnectedNote docsVersion={docsVersion} lastConnectionTs={connect_updated_ts} style={buttonStyle} />
          )}
          {connect_status === DEVICE_CONNECT_STATES.connected &&
            Object.entries(troubleshootingTools)
              .reverse()
              .reduce(
                (accu, [type, item]) => {
                  accu.unshift(
                    <Button
                      key={type}
                      onClick={() => startTroubleshoot(type)}
                      disabled={!socketClosed}
                      startIcon={item.icon}
                      style={{ marginRight: theme.spacing(2) }}
                    >
                      <Typography variant="subtitle2" style={buttonStyle}>
                        {item.title}
                      </Typography>
                    </Button>
                  );
                  return accu;
                },
                [<PortForwardLink key="port-forward" docsVersion={docsVersion} />]
              )}
        </div>
      }
      isAddOn
      title="Troubleshoot"
    ></DeviceDataCollapse>
  );
};

export default DeviceConnection;
