import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const RemoveArtifactDialog = ({ artifact, onCancel, onRemove }) => (
  <Dialog open>
    <DialogTitle>Remove this artifact?</DialogTitle>
    <DialogContent>
      Are you sure you want to remove <i>{artifact}</i>?
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <div style={{ flexGrow: 1 }} />
      <Button variant="contained" color="secondary" onClick={onRemove}>
        Remove artifact
      </Button>
    </DialogActions>
  </Dialog>
);

export default RemoveArtifactDialog;
