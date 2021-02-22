import React from 'react';
import Time from 'react-time';

import { Button, Typography, SvgIcon } from '@material-ui/core';
import { mdiConsole as ConsoleIcon } from '@mdi/js';
import { ImportExport as ImportExportIcon } from '@material-ui/icons';
import theme from '../../../themes/mender-theme';

import { DEVICE_CONNECT_STATES } from '../../../constants/deviceConstants';

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

export const DeviceConnection = ({ device, docsVersion = '', hasFileTransfer, startTroubleshoot, socketClosed, style }) => {
  const { connect_status = DEVICE_CONNECT_STATES.unknown, connect_updated_ts } = device;
  return (
    <div className="flexbox" style={{ flexDirection: 'row', ...style }}>
      {connect_status === DEVICE_CONNECT_STATES.unknown && (
        <Typography variant="body1" style={buttonStyle}>
          The troubleshoot add-on does not seem to be enabled on this device.
          <br />
          Please see{' '}
          <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
            the documentation
          </a>{' '}
          for a description on how it works and how to enable it.
        </Typography>
      )}
      {connect_status === DEVICE_CONNECT_STATES.disconnected && (
        <Typography variant="body1" style={buttonStyle}>
          The troubleshoot add-on is not currently connected on this device, it was last connected on{' '}
          <Time value={connect_updated_ts} format="YYYY-MM-DD HH:mm" />.<br />
          Please see{' '}
          <a target="_blank" rel="noopener noreferrer" href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`}>
            the documentation
          </a>{' '}
          for more information.
        </Typography>
      )}
      {connect_status === DEVICE_CONNECT_STATES.connected &&
        Object.entries(troubleshootingTools).reduce((accu, [type, item]) => {
          if (!hasFileTransfer && type === 'transfer') {
            return accu;
          }
          accu.push(
            <Button key={type} onClick={() => startTroubleshoot(type)} disabled={!socketClosed} startIcon={item.icon} style={{ marginLeft: theme.spacing(2) }}>
              <Typography variant="subtitle2" style={buttonStyle}>
                {item.title}
              </Typography>
            </Button>
          );
          return accu;
        }, [])}
    </div>
  );
};

export default DeviceConnection;
