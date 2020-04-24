import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

export class DeploymentLog extends React.Component {
  constructor(props, state) {
    super(props, state);
    this.state = {
      copied: false
    };
  }

  exportLog(content) {
    const uriContent = `data:application/octet-stream,${encodeURIComponent(content)}`;
    window.open(uriContent, 'deviceLog');
  }

  render() {
    const self = this;
    const { onClose, logData } = self.props;
    const { copied } = self.state;
    return (
      <Dialog open={true}>
        <DialogTitle>Deployment log for device</DialogTitle>
        <DialogContent>
          <div className="code log">{logData}</div>
          <p style={{ marginLeft: 24 }}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
        </DialogContent>
        <DialogActions>
          <div key="log-action-button-1" style={{ marginRight: 10, display: 'inline-block' }}>
            <Button onClick={onClose}>Cancel</Button>
          </div>
          <CopyToClipboard
            key="log-action-button-2"
            style={{ marginRight: 10, display: 'inline-block' }}
            text={logData}
            onCopy={() => self.setState({ copied: true })}
          >
            <Button>Copy to clipboard</Button>
          </CopyToClipboard>
          <Button variant="contained" key="log-action-button-3" color="primary" onClick={() => self.exportLog(logData)}>
            Export log
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeploymentLog;
