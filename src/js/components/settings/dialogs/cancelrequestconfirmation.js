import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

const CancelRequestConfirmationDialog = ({ open, onCancel, onSubmit }) => (
  <Dialog open={open}>
    <DialogTitle>Confirm the cancellation of your subscription</DialogTitle>
    <DialogContent>Are you sure you want to proceed with the submission of the request to cancel your subscription?</DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <div style={{ flexGrow: 1 }} />
      <Button variant="contained" color="secondary" onClick={onSubmit}>
        Yes, send the request
      </Button>
    </DialogActions>
  </Dialog>
);

export default CancelRequestConfirmationDialog;
