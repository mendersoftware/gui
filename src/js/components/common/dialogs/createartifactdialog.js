// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { advanceOnboarding, setShowCreateArtifactDialog } from '../../../actions/onboardingActions';
import { onboardingSteps } from '../../../constants/onboardingConstants';
import { getOnboardingState } from '../../../selectors';
import CopyCode from '../copy-code';

const file_modification = `cat >index.html <<EOF
Hello World!
EOF
`;

export const CreateArtifactDialog = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { showCreateArtifactDialog } = useSelector(getOnboardingState);

  const onClose = () => {
    navigate('/releases');
    dispatch(setShowCreateArtifactDialog(false));
    dispatch(advanceOnboarding(onboardingSteps.ARTIFACT_CREATION_DIALOG));
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

export default CreateArtifactDialog;
