import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import CopyCode from '../../common/copy-code';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';

export const ExternalDeviceConnectionDialog = ({ connectionString, onClose, provider }) => (
  <Dialog open fullWidth maxWidth="sm">
    <DialogTitle>Connecting {`${EXTERNAL_PROVIDER[provider].article} ${EXTERNAL_PROVIDER[provider].title}`} device</DialogTitle>
    <DialogContent className="onboard-dialog" style={{ margin: '0 30px' }}>
      <div>
        <b>Log into your device and install the Mender client</b>
        <p>
          Copy & paste and run this command <b>on your device</b>:
        </p>
        <CopyCode code={connectionString} withDescription />
        <p>This downloads the Mender client on the device, sets the configuration and starts the client.</p>
      </div>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default ExternalDeviceConnectionDialog;
