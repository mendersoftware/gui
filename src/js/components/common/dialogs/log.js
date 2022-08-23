import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Code } from '../copy-code';

const wrapperStyle = { marginRight: 10, display: 'inline-block' };

const dialogTypes = {
  'deviceLog': {
    title: 'Deployment log for device',
    filename: 'deviceLog'
  },
  'configUpdateLog': {
    title: 'Config update log for device',
    filename: 'updateLog'
  },
  'monitorLog': {
    title: 'Alert log for device',
    filename: 'monitorLog'
  }
};

export const LogDialog = ({ logData = '', onClose, type = 'deviceLog' }) => {
  const [copied, setCopied] = useState(false);

  const exportLog = () => {
    const uriContent = `data:application/octet-stream,${encodeURIComponent(logData)}`;
    window.open(uriContent, dialogTypes[type].filename);
  };

  return (
    <Dialog open={true}>
      <DialogTitle>{dialogTypes[type].title}</DialogTitle>
      <DialogContent>
        <Code className="log">{logData}</Code>
        <p style={{ marginLeft: 24 }}>{copied && <span className="green fadeIn">Copied to clipboard.</span>}</p>
      </DialogContent>
      <DialogActions>
        <div style={wrapperStyle}>
          <Button onClick={onClose}>Cancel</Button>
        </div>
        <CopyToClipboard style={wrapperStyle} text={logData} onCopy={() => setCopied(true)}>
          <Button>Copy to clipboard</Button>
        </CopyToClipboard>
        <Button variant="contained" color="primary" onClick={exportLog}>
          Export log
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDialog;
