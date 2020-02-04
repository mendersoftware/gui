import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import CopyCode from '../copy-code';

export class CreateArtifactDialog extends React.PureComponent {
  render() {
    const self = this;
    const { open, onCancel, onClose } = self.props;

    const file_modification = `cat >index.html <<EOF
Hello World!
EOF
`;

    return (
      <Dialog open={open || false} fullWidth={true} maxWidth="sm">
        <DialogTitle>Creating a new Release</DialogTitle>
        <DialogContent className="onboard-dialog dialog-content">
          <div>
            Now we&apos;ll make an update to the webserver demo running on your device, using a new Release that you will create yourself.
            <p>
              On your workstation, create a new <i>index.html</i> file with the simple contents &apos;Hello world&apos;. This will be the new web page after you
              update the application, so you&apos;ll be able to easily see when your device has received the update. Copy and run the command to create the
              file:
            </p>
            <CopyCode code={file_modification} withDescription={true} />
            <p>When you have done that, click &apos;Next&apos;</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <div style={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={onClose}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default CreateArtifactDialog;
