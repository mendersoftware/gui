import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { advanceOnboarding, setShowCreateArtifactDialog } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import CopyCode from '../copy-code';

const file_modification = `cat >index.html <<EOF
Hello World!
EOF
`;

export const CreateArtifactDialog = ({ advanceOnboarding, history, setShowCreateArtifactDialog, showCreateArtifactDialog = true }) => {
  const onClose = () => {
    history.push('/releases');
    setShowCreateArtifactDialog(false);
    advanceOnboarding(onboardingSteps.ARTIFACT_CREATION_DIALOG);
  };

  return (
    <Dialog open={showCreateArtifactDialog} fullWidth={true} maxWidth="sm">
      <DialogTitle>Creating a new Release</DialogTitle>
      <DialogContent className="onboard-dialog dialog-content">
        <>
          Now we&apos;ll make an update to the webserver demo running on your device, using a new Release that you will create yourself.
          <p>
            On your workstation, create a new <i>index.html</i> file with the simple contents &apos;Hello world&apos;. This will be the new web page after you
            update the application, so you&apos;ll be able to easily see when your device has received the update. Copy and run the command to create the file:
          </p>
          <CopyCode code={file_modification} withDescription={true} />
          <p>When you have done that, click &apos;Next&apos;</p>
        </>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCreateArtifactDialog(false)}>Cancel</Button>
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={onClose}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const actionCreators = { advanceOnboarding, setShowCreateArtifactDialog };

const mapStateToProps = state => {
  return {
    showCreateArtifactDialog: state.onboarding.showCreateArtifactDialog
  };
};

export default compose(withRouter, connect(mapStateToProps, actionCreators))(CreateArtifactDialog);
