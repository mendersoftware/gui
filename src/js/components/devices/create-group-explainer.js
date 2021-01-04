import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import CreateGroupExplainerContent from './create-group-explainer-content';

export const CreateGroupExplainer = ({ isEnterprise, onClose }) => (
  <Dialog className="dialog" disableBackdropClick disableEscapeKeyDown open={true} scroll="paper" fullWidth={true} maxWidth="md">
    <DialogTitle style={{ marginLeft: 15 }}>Creating a group</DialogTitle>
    <DialogContent>
      <CreateGroupExplainerContent isEnterprise={isEnterprise} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default CreateGroupExplainer;
