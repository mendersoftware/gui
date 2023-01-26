import React from 'react';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { getDebConfigurationCode } from '../../../helpers';
import CopyCode from '../../common/copy-code';

export const ConnectToGatewayDialog = ({ docsVersion, gatewayIp, isPreRelease, onCancel, tenantToken }) => (
  <Dialog open fullWidth maxWidth="md">
    <DialogTitle>Connecting a device to a gateway</DialogTitle>
    <DialogContent className="onboard-dialog dialog-content">
      On the device terminal, run the following command:
      <CopyCode code={getDebConfigurationCode({ ipAddress: gatewayIp, isDemoMode: true, tenantToken, isPreRelease })} withDescription />
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

export default ConnectToGatewayDialog;
