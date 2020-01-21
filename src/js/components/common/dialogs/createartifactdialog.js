import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import CopyPasteIcon from '@material-ui/icons/FileCopy';

export class CreateArtifactDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { copied: false };
  }

  copied(copied) {
    var self = this;
    self.setState({ copied });
    setTimeout(() => self.setState({ copied: false }), 5000);
  }

  render() {
    const self = this;
    const { open, onCancel, onClose } = self.props;
    const { copied } = self.state;

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
            <div className="code">
              <CopyToClipboard text={file_modification} onCopy={() => self.copied(true)}>
                <Button style={{ float: 'right', margin: '-20px 0 0 10px' }}>
                  <CopyPasteIcon />
                  Copy to clipboard
                </Button>
              </CopyToClipboard>
              <span style={{ wordBreak: 'break-word' }}>{file_modification}</span>
            </div>
            <p>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
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
