import React from 'react';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { getToken } from '../../../auth';
import CopyCode from '../../common/copy-code';

export const getCode = isPreRelease => {
  const { target, flags } = isPreRelease
    ? { target: 'https://get.mender.io/staging', flags: ' -c --experimental' }
    : { target: 'https://get.mender.io', flags: '' };
  return `JWT_TOKEN='${getToken()}'

wget -O- ${target} | sudo bash -s -- --jwt-token $JWT_TOKEN mender-gateway --demo${flags}`;
};

export const MakeGatewayDialog = ({ docsVersion, isPreRelease, onCancel }) => (
  <Dialog open fullWidth maxWidth="md">
    <DialogTitle>Promoting a device to a gateway</DialogTitle>
    <DialogContent className="onboard-dialog dialog-content">
      You can test Mender Gateway by promoting a device to a gateway device, enabling other devices to securely contact the Mender Server through it.
      <p>
        On the device terminal, run the following command. You can use{' '}
        <a href={`https://docs.mender.io/${docsVersion}add-ons/remote-terminal`} target="_blank" rel="noopener noreferrer">
          Remote Terminal
        </a>{' '}
        if mender-connect is enabled on the device.
      </p>
      <CopyCode code={getCode(isPreRelease)} withDescription />
      <p>
        Note: this is only intended for demo or testing purposes. For production installation please refer to the{' '}
        <a href={`https://docs.mender.io/${docsVersion}get-started/mender-gateway`} target="_blank" rel="noopener noreferrer">
          full Mender Gateway documentation
        </a>
      </p>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <div style={{ flexGrow: 1 }} />
      <Button variant="contained" onClick={onCancel} color="secondary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default MakeGatewayDialog;
