import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const content = {
  artifact: ({ artifact }) => (
    <>
      Are you sure you want to remove <i>{artifact.name}</i>?
    </>
  ),
  release: ({ release }) => (
    <>
      All artifacts in the <i>{release.Name}</i> release will be removed. Are you sure?
    </>
  )
};

const RemoveArtifactDialog = ({ artifact, onCancel, open, onRemove, release }) => {
  const type = artifact ? 'artifact' : 'release';
  const Content = content[type];
  return (
    <Dialog open={open}>
      <DialogTitle>Remove this {type}?</DialogTitle>
      <DialogContent>
        <Content artifact={artifact} release={release} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" color="secondary" onClick={onRemove}>
          Remove {type}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveArtifactDialog;
